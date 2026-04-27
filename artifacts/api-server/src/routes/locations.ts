import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import {
  db,
  locationsTable,
  inventoryTable,
  productsTable,
} from "@workspace/db";
import {
  CreateLocationBody,
  UpdateLocationBody,
  GetLocationParams,
  UpdateLocationParams,
  DeleteLocationParams,
  ListLocationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function deriveStockStatus(totalUnits: number, capacity: number) {
  if (capacity <= 0) return "healthy" as const;
  const pct = totalUnits / capacity;
  if (pct < 0.2) return "critical" as const;
  if (pct < 0.45) return "low" as const;
  return "healthy" as const;
}

async function statsFor(locationId: number, capacity: number) {
  const rows = await db
    .select({
      quantity: inventoryTable.quantity,
      productId: inventoryTable.productId,
    })
    .from(inventoryTable)
    .where(eq(inventoryTable.locationId, locationId));
  const totalUnits = rows.reduce((s, r) => s + (r.quantity ?? 0), 0);
  const distinctSkus = new Set(rows.map((r) => r.productId)).size;
  const utilizationPct =
    capacity > 0 ? Math.min(100, (totalUnits / capacity) * 100) : 0;
  return {
    totalUnits,
    distinctSkus,
    stockStatus: deriveStockStatus(totalUnits, capacity),
    utilizationPct: Math.round(utilizationPct * 10) / 10,
  };
}

router.get("/locations", async (req, res): Promise<void> => {
  const parsed = ListLocationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const where = parsed.data.type
    ? eq(locationsTable.type, parsed.data.type)
    : undefined;
  const locs = await db
    .select()
    .from(locationsTable)
    .where(where)
    .orderBy(locationsTable.id);
  const enriched = await Promise.all(
    locs.map(async (l) => ({
      ...l,
      ...(await statsFor(l.id, l.capacity)),
    })),
  );
  res.json(enriched);
});

router.post("/locations", async (req, res): Promise<void> => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(locationsTable)
    .values({
      name: parsed.data.name,
      type: parsed.data.type,
      city: parsed.data.city,
      state: parsed.data.state,
      address: parsed.data.address,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      capacity: parsed.data.capacity,
      contactName: parsed.data.contactName ?? null,
      contactPhone: parsed.data.contactPhone ?? null,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/locations/:id", async (req, res): Promise<void> => {
  const params = GetLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [loc] = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, params.data.id));
  if (!loc) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  const inventoryRows = await db
    .select({
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
    })
    .from(inventoryTable)
    .innerJoin(productsTable, eq(productsTable.id, inventoryTable.productId))
    .innerJoin(locationsTable, eq(locationsTable.id, inventoryTable.locationId))
    .where(eq(inventoryTable.locationId, params.data.id));
  const stats = await statsFor(loc.id, loc.capacity);
  res.json({ ...loc, ...stats, inventory: inventoryRows });
});

router.patch("/locations/:id", async (req, res): Promise<void> => {
  const params = UpdateLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(locationsTable)
    .set(parsed.data)
    .where(eq(locationsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.json(row);
});

router.delete("/locations/:id", async (req, res): Promise<void> => {
  const params = DeleteLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(locationsTable).where(eq(locationsTable.id, params.data.id));
  res.sendStatus(204);
});

// silence unused imports
void sql;
void and;

export default router;
