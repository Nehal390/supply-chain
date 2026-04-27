import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  alertsTable,
  locationsTable,
  productsTable,
} from "@workspace/db";

const router: IRouter = Router();

const alertSelect = {
  id: alertsTable.id,
  type: alertsTable.type,
  severity: alertsTable.severity,
  message: alertsTable.message,
  locationId: alertsTable.locationId,
  productId: alertsTable.productId,
  resolved: alertsTable.resolved,
  createdAt: alertsTable.createdAt,
  locationName: locationsTable.name,
  productName: productsTable.name,
};

router.get("/alerts", async (_req, res): Promise<void> => {
  const rows = await db
    .select(alertSelect)
    .from(alertsTable)
    .leftJoin(locationsTable, eq(locationsTable.id, alertsTable.locationId))
    .leftJoin(productsTable, eq(productsTable.id, alertsTable.productId))
    .orderBy(desc(alertsTable.createdAt));
  res.json(rows);
});

router.patch("/alerts/:id/resolve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(String(raw), 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [updated] = await db
    .update(alertsTable)
    .set({ resolved: true })
    .where(eq(alertsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  const [row] = await db
    .select(alertSelect)
    .from(alertsTable)
    .leftJoin(locationsTable, eq(locationsTable.id, alertsTable.locationId))
    .leftJoin(productsTable, eq(productsTable.id, alertsTable.productId))
    .where(eq(alertsTable.id, id));
  res.json(row);
});

export default router;
