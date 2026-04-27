import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, inventoryTable, locationsTable } from "@workspace/db";
import { SuggestFulfillmentBody } from "@workspace/api-zod";
import { haversineKm, estimateHours } from "../lib/distance";

const router: IRouter = Router();

router.post("/fulfillment/suggest", async (req, res): Promise<void> => {
  const parsed = SuggestFulfillmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { productId, quantity, deliveryLat, deliveryLng } = parsed.data;

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
        eq(inventoryTable.productId, productId),
        gt(inventoryTable.quantity, 0),
      ),
    );

  const ranked = candidates
    .map((c) => {
      const distanceKm =
        Math.round(
          haversineKm(deliveryLat, deliveryLng, c.lat, c.lng) * 10,
        ) / 10;
      return {
        locationId: c.locationId,
        locationName: c.locationName,
        locationCity: c.locationCity,
        quantity: c.quantity,
        distanceKm,
        estimatedDeliveryHours: estimateHours(distanceKm),
      };
    })
    .sort((a, b) => {
      const aCovers = a.quantity >= quantity ? 0 : 1;
      const bCovers = b.quantity >= quantity ? 0 : 1;
      if (aCovers !== bCovers) return aCovers - bCovers;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, 6);
  res.json(ranked);
});

export default router;
