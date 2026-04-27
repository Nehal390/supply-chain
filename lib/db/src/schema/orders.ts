import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";
import { locationsTable } from "./locations";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  sourceLocationId: integer("source_location_id").references(
    () => locationsTable.id,
    { onDelete: "set null" },
  ),
  status: text("status").notNull().default("pending"),
  estimatedDeliveryHours: doublePrecision("estimated_delivery_hours"),
  distanceKm: doublePrecision("distance_km"),
  deliveryAddress: text("delivery_address").notNull().default(""),
  deliveryCity: text("delivery_city").notNull().default(""),
  deliveryLat: doublePrecision("delivery_lat").notNull(),
  deliveryLng: doublePrecision("delivery_lng").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export type Order = typeof ordersTable.$inferSelect;
