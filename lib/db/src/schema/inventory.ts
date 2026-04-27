import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { locationsTable } from "./locations";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locationsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(10),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Inventory = typeof inventoryTable.$inferSelect;
