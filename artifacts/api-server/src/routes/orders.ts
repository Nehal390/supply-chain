import { Router, type IRouter } from "express";
import { eq, and, gt, desc } from "drizzle-orm";
import {
  db,
  ordersTable,
  inventoryTable,
  locationsTable,
  productsTable,
  usersTable,
  alertsTable,
  inventoryEventsTable,
} from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  ListOrdersQueryParams,
} from "@workspace/api-zod";
import { haversineKm, estimateHours } from "../lib/distance";

const router: IRouter = Router();

const orderSelect = {
  id: ordersTable.id,
  customerId: ordersTable.customerId,
  productId: ordersTable.productId,
  quantity: ordersTable.quantity,
  sourceLocationId: ordersTable.sourceLocationId,
  status: ordersTable.status,
  estimatedDeliveryHours: ordersTable.estimatedDeliveryHours,
  distanceKm: ordersTable.distanceKm,
  createdAt: ordersTable.createdAt,
  customerName: usersTable.name,
  productName: productsTable.name,
  sourceLocationName: locationsTable.name,
};

async function fetchOrder(id: number) {
  const [row] = await db
    .select(orderSelect)
    .from(ordersTable)
    .innerJoin(usersTable, eq(usersTable.id, ordersTable.customerId))
    .innerJoin(productsTable, eq(productsTable.id, ordersTable.productId))
    .leftJoin(
      locationsTable,
      eq(locationsTable.id, ordersTable.sourceLocationId),
    )
    .where(eq(ordersTable.id, id));
  return row;
}

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const where = parsed.data.customerId
    ? eq(ordersTable.customerId, parsed.data.customerId)
    : undefined;
  const rows = await db
    .select(orderSelect)
    .from(ordersTable)
    .innerJoin(usersTable, eq(usersTable.id, ordersTable.customerId))
    .innerJoin(productsTable, eq(productsTable.id, ordersTable.productId))
    .leftJoin(
      locationsTable,
      eq(locationsTable.id, ordersTable.sourceLocationId),
    )
    .where(where)
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const {
    customerId,
    productId,
    quantity,
    deliveryAddress,
    deliveryCity,
    deliveryLat,
    deliveryLng,
  } = parsed.data;

  const candidates = await db
    .select({
      id: inventoryTable.id,
      locationId: inventoryTable.locationId,
      quantity: inventoryTable.quantity,
      lat: locationsTable.lat,
      lng: locationsTable.lng,
    })
    .from(inventoryTable)
    .innerJoin(
      locationsTable,
      eq(locationsTable.id, inventoryTable.locationId),
    )
    .where(
      and(
        eq(inventoryTable.productId, productId),
        gt(inventoryTable.quantity, 0),
      ),
    );

  const sufficient = candidates.filter((c) => c.quantity >= quantity);
  const pool = sufficient.length > 0 ? sufficient : candidates;
  if (pool.length === 0) {
    res.status(409).json({ error: "No stock available" });
    return;
  }
  const ranked = pool
    .map((c) => ({
      ...c,
      distanceKm:
        Math.round(
          haversineKm(deliveryLat, deliveryLng, c.lat, c.lng) * 10,
        ) / 10,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const source = ranked[0]!;
  const fulfilled = Math.min(source.quantity, quantity);

  const [created] = await db
    .insert(ordersTable)
    .values({
      customerId,
      productId,
      quantity,
      sourceLocationId: source.locationId,
      status: "pending",
      distanceKm: source.distanceKm,
      estimatedDeliveryHours: estimateHours(source.distanceKm),
      deliveryAddress,
      deliveryCity,
      deliveryLat,
      deliveryLng,
    })
    .returning();

  await db
    .update(inventoryTable)
    .set({ quantity: source.quantity - fulfilled })
    .where(eq(inventoryTable.id, source.id));

  await db.insert(inventoryEventsTable).values({
    productId,
    locationId: source.locationId,
    delta: -fulfilled,
    reason: `order:${created!.id}`,
  });

  // post-decrement: maybe raise alert if below threshold
  const [postRow] = await db
    .select({
      quantity: inventoryTable.quantity,
      threshold: inventoryTable.threshold,
      locationId: inventoryTable.locationId,
      productId: inventoryTable.productId,
    })
    .from(inventoryTable)
    .where(eq(inventoryTable.id, source.id));
  if (postRow && postRow.quantity < postRow.threshold) {
    const severity = postRow.quantity === 0 ? "critical" : "warning";
    await db.insert(alertsTable).values({
      type: "shortage",
      severity,
      message: `Stock at ${postRow.quantity} units after order #${created!.id}`,
      locationId: postRow.locationId,
      productId: postRow.productId,
    });
  }

  const full = await fetchOrder(created!.id);
  res.status(201).json(full);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await fetchOrder(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(row);
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: { status: string; deliveredAt?: Date } = {
    status: parsed.data.status,
  };
  if (parsed.data.status === "delivered") {
    updates.deliveredAt = new Date();
  }
  const [updated] = await db
    .update(ordersTable)
    .set(updates)
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const row = await fetchOrder(params.data.id);
  res.json(row);
});

export default router;
