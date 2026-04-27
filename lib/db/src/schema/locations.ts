import {
  pgTable,
  serial,
  text,
  timestamp,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  capacity: integer("capacity").notNull(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Location = typeof locationsTable.$inferSelect;
