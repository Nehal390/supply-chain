import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { locationsTable } from "./locations";

export const inventoryEventsTable = pgTable("inventory_events", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locationsTable.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InventoryEvent = typeof inventoryEventsTable.$inferSelect;
