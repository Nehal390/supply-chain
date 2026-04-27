import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { locationsTable } from "./locations";
import { productsTable } from "./products";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  locationId: integer("location_id").references(() => locationsTable.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => productsTable.id, {
    onDelete: "cascade",
  }),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Alert = typeof alertsTable.$inferSelect;
