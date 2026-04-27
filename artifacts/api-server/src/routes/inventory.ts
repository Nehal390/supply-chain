import { Router, type IRouter } from "express";
import { eq, and, lt, sql } from "drizzle-orm";
import {
  db,
  inventoryTable,
  productsTable,
  locationsTable,
} from "@workspace/db";
import {
  CreateInventoryBody,
  UpdateInventoryBody,
  UpdateInventoryParams,
  DeleteInventoryParams,
  ListInventoryQueryParams,
} from "@workspace/api-zod";
import { haversineKm } from "../lib/distance";

const router: IRouter = Router();

const baseSelect = {
  id: inventoryTable.id,
  productId: inventoryTable.productId,
  locationId: inventoryTable.locationId,
  quantity: inventoryTable.quantity,
  threshold: inventoryTable.threshold,
  productName: productsTable.name,
  productSku: productsTable.sku,
  productCategory: productsTable.category,
  locationName: locationsTable.name,
  locationCity: locationsTable.city,
};

router.get("/inventory", async (req, res): Promise<void> => {
  const parsed = ListInventoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const conditions = [];
  if (parsed.data.locationId)
    conditions.push(eq(inventoryTable.locationId, parsed.data.locationId));
  if (parsed.data.productId)
    conditions.push(eq(inventoryTable.productId, parsed.data.productId));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select(baseSelect)
    .from(inventoryTable)
    .innerJoin(productsTable, eq(productsTable.id, inventoryTable.productId))
    .innerJoin(locationsTable, eq(locationsTable.id, inventoryTable.locationId))
    .where(where)
    .orderBy(inventoryTable.id);
  res.json(rows);
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(inventoryTable)
    .values({
      productId: parsed.data.productId,
      locationId: parsed.data.locationId,
      quantity: parsed.data.quantity ?? 0,
      threshold: parsed.data.threshold ?? 10,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Insert failed" });
    return;
  }
  const [row] = await db
    .select(baseSelect)
    .from(inventoryTable)
    .innerJoin(productsTable, eq(productsTable.id, inventoryTable.productId))
    .innerJoin(locationsTable, eq(locationsTable.id, inventoryTable.locationId))
    .where(eq(inventoryTable.id, created.id));
  res.status(201).json(row);
});

router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(inventoryTable)
    .set(parsed.data)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Inventory row not found" });
    return;
  }
  const [row] = await db
    .select(baseSelect)
    .from(inventoryTable)
    .innerJoin(productsTable, eq(productsTable.id, inventoryTable.productId))
    .innerJoin(locationsTable, eq(locationsTable.id, inventoryTable.locationId))
    .where(eq(inventoryTable.id, updated.id));
  res.json(row);
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/inventory/shortages", async (_req, res): Promise<void> => {
  const shortRows = await db
    .select({
      ...baseSelect,
      lat: locationsTable.lat,
      lng: locationsTable.lng,
    })
    .from(inventoryTable)
    .innerJoin(productsTable, eq(productsTable.id, inventoryTable.productId))
    .innerJoin(locationsTable, eq(locationsTable.id, inventoryTable.locationId))
    .where(lt(inventoryTable.quantity, inventoryTable.threshold))
    .orderBy(inventoryTable.id);

  const result = await Promise.all(
    shortRows.map(async (s) => {
      const candidates = await db
        .select({
          locationId: inventoryTable.locationId,
          quantity: inventoryTable.quantity,
          locationName: locationsTable.name,
          locationCity: locationsTable.city,
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
            eq(inventoryTable.productId, s.productId),
            sql`${inventoryTable.quantity} >= ${inventoryTable.threshold}`,
          ),
        );
      let nearest: {
        locationId: number;
        locationName: string;
        locationCity: string;
        distanceKm: number;
        quantity: number;
      } | null = null;
      for (const c of candidates) {
        if (c.locationId === s.locationId) continue;
        const distance = haversineKm(s.lat, s.lng, c.lat, c.lng);
        if (!nearest || distance < nearest.distanceKm) {
          nearest = {
            locationId: c.locationId,
            locationName: c.locationName,
            locationCity: c.locationCity,
            distanceKm: Math.round(distance * 10) / 10,
            quantity: c.quantity,
          };
        }
      }
      const { lat: _lat, lng: _lng, ...row } = s;
      void _lat;
      void _lng;
      return {
        ...row,
        shortfall: Math.max(0, row.threshold - row.quantity),
        nearestAlternativeName: nearest ? nearest.locationName : null,
        nearestAlternativeDistanceKm: nearest ? nearest.distanceKm : null,
        nearestAlternativeQuantity: nearest ? nearest.quantity : null,
        nearestAlternativeLocationId: nearest ? nearest.locationId : null,
        nearestAlternativeCity: nearest ? nearest.locationCity : null,
      };
    }),
  );
  res.json(result);
});

export default router;
