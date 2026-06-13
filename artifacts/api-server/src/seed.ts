import { eq } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  productsTable,
  locationsTable,
  inventoryTable,
  ordersTable,
  alertsTable,
  inventoryEventsTable,
} from "@workspace/db";
import { haversineKm, estimateHours } from "./lib/distance";

const logger = {
  info: (msg: string) => console.log(`[seed] ${msg}`),
  error: (ctx: unknown, msg: string) => console.error(`[seed] ${msg}`, ctx),
};

async function ensureSeeded() {
  const [existing] = await db.select().from(usersTable).limit(1);
  if (existing) {
    logger.info("Seed already present, skipping");
    return;
  }

  logger.info("Seeding Smart Supply Chain data");

  const users = await db
    .insert(usersTable)
    .values([
      { email: "admin@scn.in", name: "Aanya Mehta", role: "admin", city: "Mumbai" },
      { email: "manager@scn.in", name: "Rohan Iyer", role: "manager", city: "Bengaluru" },
      { email: "retail@scn.in", name: "Priya Nair", role: "retail", city: "Chennai" },
      { email: "customer@scn.in", name: "Arjun Sharma", role: "customer", city: "Delhi" },
    ])
    .returning();

  const products = await db
    .insert(productsTable)
    .values([
      { name: "Basmati Rice 5kg", sku: "FOOD-RICE-5KG", category: "Groceries", unitPrice: 480 },
      { name: "Cold-Pressed Mustard Oil 1L", sku: "FOOD-OIL-MUST-1L", category: "Groceries", unitPrice: 260 },
      { name: "ORS Pack (10 sachets)", sku: "MED-ORS-10", category: "Pharma", unitPrice: 180 },
      { name: "Paracetamol 500mg (strip)", sku: "MED-PARA-500", category: "Pharma", unitPrice: 35 },
      { name: "School Notebook (200pg)", sku: "STAT-NB-200", category: "Stationery", unitPrice: 90 },
      { name: "LED Bulb 9W", sku: "ELEC-LED-9W", category: "Electronics", unitPrice: 140 },
      { name: "Cotton T-Shirt", sku: "APP-CTN-TS", category: "Apparel", unitPrice: 320 },
      { name: "Power Bank 10000mAh", sku: "ELEC-PB-10K", category: "Electronics", unitPrice: 1450 },
      { name: "Reusable Water Bottle", sku: "HOME-BOT-1L", category: "Home", unitPrice: 220 },
      { name: "Hand Sanitizer 500ml", sku: "MED-SAN-500", category: "Pharma", unitPrice: 175 },
    ])
    .returning();

  const locations = await db
    .insert(locationsTable)
    .values([
      { name: "Mumbai Central Hub", type: "warehouse", city: "Mumbai", state: "Maharashtra", address: "Dharavi Industrial Estate, Mumbai", lat: 19.076, lng: 72.8777, capacity: 12000, contactName: "Vikram Joshi", contactPhone: "+91 98200 11122" },
      { name: "Bandra Micro-Warehouse", type: "micro", city: "Mumbai", state: "Maharashtra", address: "Linking Road, Bandra West", lat: 19.0596, lng: 72.8295, capacity: 1800 },
      { name: "Andheri Micro-Warehouse", type: "micro", city: "Mumbai", state: "Maharashtra", address: "MIDC, Andheri East", lat: 19.1197, lng: 72.8468, capacity: 1500 },
      { name: "Delhi NCR Hub", type: "warehouse", city: "Delhi", state: "Delhi", address: "Okhla Phase II, New Delhi", lat: 28.5355, lng: 77.391, capacity: 11000, contactName: "Neha Kapoor", contactPhone: "+91 99100 22233" },
      { name: "Saket Micro-Warehouse", type: "micro", city: "Delhi", state: "Delhi", address: "Saket District Centre", lat: 28.5245, lng: 77.2066, capacity: 1600 },
      { name: "Gurugram Micro-Warehouse", type: "micro", city: "Gurugram", state: "Haryana", address: "Cyber City Phase III", lat: 28.4946, lng: 77.0892, capacity: 1700 },
      { name: "Bengaluru South Hub", type: "warehouse", city: "Bengaluru", state: "Karnataka", address: "Electronics City, Phase 1", lat: 12.8456, lng: 77.6603, capacity: 10000, contactName: "Karthik Rao", contactPhone: "+91 98800 33344" },
      { name: "Indiranagar Micro-Warehouse", type: "micro", city: "Bengaluru", state: "Karnataka", address: "100 Feet Road, Indiranagar", lat: 12.9719, lng: 77.6412, capacity: 1500 },
      { name: "Whitefield Micro-Warehouse", type: "micro", city: "Bengaluru", state: "Karnataka", address: "ITPL Main Road, Whitefield", lat: 12.9698, lng: 77.7499, capacity: 1400 },
      { name: "Chennai Port Hub", type: "warehouse", city: "Chennai", state: "Tamil Nadu", address: "Manali Industrial Area", lat: 13.1707, lng: 80.2587, capacity: 9000, contactName: "Lakshmi Narayanan", contactPhone: "+91 98400 44455" },
      { name: "T. Nagar Micro-Warehouse", type: "micro", city: "Chennai", state: "Tamil Nadu", address: "Pondy Bazaar, T. Nagar", lat: 13.0418, lng: 80.2341, capacity: 1300 },
      { name: "Hyderabad Hub", type: "warehouse", city: "Hyderabad", state: "Telangana", address: "Patancheru Industrial Estate", lat: 17.5314, lng: 78.2622, capacity: 8500, contactName: "Sneha Reddy", contactPhone: "+91 96400 55566" },
      { name: "HITEC City Micro-Warehouse", type: "micro", city: "Hyderabad", state: "Telangana", address: "HITEC City, Madhapur", lat: 17.4474, lng: 78.3762, capacity: 1500 },
      { name: "Kolkata East Hub", type: "warehouse", city: "Kolkata", state: "West Bengal", address: "Salt Lake Sector V", lat: 22.5726, lng: 88.4324, capacity: 8000, contactName: "Debashish Bose", contactPhone: "+91 98300 66677" },
      { name: "Park Street Micro-Warehouse", type: "micro", city: "Kolkata", state: "West Bengal", address: "Park Street", lat: 22.5535, lng: 88.3517, capacity: 1200 },
      { name: "Pune Micro-Warehouse", type: "micro", city: "Pune", state: "Maharashtra", address: "Hinjawadi Phase II", lat: 18.5908, lng: 73.7372, capacity: 1600 },
      { name: "Ahmedabad Micro-Warehouse", type: "micro", city: "Ahmedabad", state: "Gujarat", address: "SG Highway", lat: 23.0362, lng: 72.5066, capacity: 1500 },
      { name: "Jaipur Micro-Warehouse", type: "micro", city: "Jaipur", state: "Rajasthan", address: "Malviya Nagar Industrial Area", lat: 26.8506, lng: 75.806, capacity: 1300 },
    ])
    .returning();

  const inventoryRows: {
    productId: number;
    locationId: number;
    quantity: number;
    threshold: number;
  }[] = [];
  for (const loc of locations) {
    const isWarehouse = loc.type === "warehouse";
    for (const prod of products) {
      // Sparser coverage at micro-warehouses
      if (!isWarehouse && Math.random() < 0.25) continue;
      const baseQty = isWarehouse
        ? 200 + Math.floor(Math.random() * 600)
        : 25 + Math.floor(Math.random() * 100);
      const threshold = isWarehouse ? 100 : 25;
      // ~15% are in shortage
      const shortage = Math.random() < 0.15;
      const quantity = shortage
        ? Math.floor(threshold * Math.random() * 0.6)
        : baseQty;
      inventoryRows.push({
        productId: prod.id,
        locationId: loc.id,
        quantity,
        threshold,
      });
    }
  }
  await db.insert(inventoryTable).values(inventoryRows);

  // Seed orders across last 30 days, with deliveries that update inventory accounting
  const customer = users.find((u) => u.role === "customer")!;
  const destinations = [
    { lat: 19.0176, lng: 72.8562, address: "Worli Sea Face", city: "Mumbai" },
    { lat: 28.6139, lng: 77.209, address: "Connaught Place", city: "Delhi" },
    { lat: 12.9716, lng: 77.5946, address: "MG Road", city: "Bengaluru" },
    { lat: 13.0827, lng: 80.2707, address: "Anna Salai", city: "Chennai" },
    { lat: 22.5726, lng: 88.3639, address: "Esplanade", city: "Kolkata" },
    { lat: 17.385, lng: 78.4867, address: "Banjara Hills", city: "Hyderabad" },
    { lat: 23.0225, lng: 72.5714, address: "Navrangpura", city: "Ahmedabad" },
    { lat: 18.5204, lng: 73.8567, address: "Koregaon Park", city: "Pune" },
  ];

  const seededOrders: { id: number; productId: number; locationId: number; quantity: number }[] = [];
  for (let i = 0; i < 60; i++) {
    const product = products[Math.floor(Math.random() * products.length)]!;
    const dest = destinations[Math.floor(Math.random() * destinations.length)]!;
    const quantity = 1 + Math.floor(Math.random() * 6);
    const candidates = inventoryRows
      .filter((r) => r.productId === product.id && r.quantity > 0)
      .map((r) => {
        const loc = locations.find((l) => l.id === r.locationId)!;
        return {
          ...r,
          distanceKm:
            Math.round(haversineKm(dest.lat, dest.lng, loc.lat, loc.lng) * 10) /
            10,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
    const source = candidates[0];
    if (!source) continue;
    const daysAgo = Math.floor(Math.random() * 30);
    const created = new Date();
    created.setDate(created.getDate() - daysAgo);
    let status: string;
    if (daysAgo > 5) status = Math.random() < 0.85 ? "delivered" : "cancelled";
    else if (daysAgo > 2) status = Math.random() < 0.6 ? "delivered" : "in_transit";
    else status = Math.random() < 0.5 ? "in_transit" : Math.random() < 0.5 ? "dispatched" : "pending";

    const [created_order] = await db
      .insert(ordersTable)
      .values({
        customerId: customer.id,
        productId: product.id,
        quantity,
        sourceLocationId: source.locationId,
        status,
        distanceKm: source.distanceKm,
        estimatedDeliveryHours: estimateHours(source.distanceKm),
        deliveryAddress: dest.address,
        deliveryCity: dest.city,
        deliveryLat: dest.lat,
        deliveryLng: dest.lng,
        createdAt: created,
        deliveredAt: status === "delivered" ? new Date(created.getTime() + 24 * 60 * 60 * 1000) : null,
      })
      .returning();
    if (created_order) {
      seededOrders.push({
        id: created_order.id,
        productId: product.id,
        locationId: source.locationId,
        quantity,
      });
    }
  }

  // Record inventory events for the seeded orders so trend reconstruction has data
  for (const o of seededOrders) {
    await db.insert(inventoryEventsTable).values({
      productId: o.productId,
      locationId: o.locationId,
      delta: -o.quantity,
      reason: `seed:order:${o.id}`,
    });
  }

  // Active alerts derived from current shortages
  const shortageRows = await db
    .select({
      productId: inventoryTable.productId,
      locationId: inventoryTable.locationId,
      quantity: inventoryTable.quantity,
      threshold: inventoryTable.threshold,
    })
    .from(inventoryTable);
  const alertValues = shortageRows
    .filter((r) => r.quantity < r.threshold)
    .slice(0, 12)
    .map((r) => ({
      type: "shortage",
      severity: r.quantity < r.threshold * 0.4 ? "critical" : "warning",
      message: `Stock at ${r.quantity} units (threshold ${r.threshold})`,
      productId: r.productId,
      locationId: r.locationId,
      resolved: false,
    }));
  if (alertValues.length > 0) {
    await db.insert(alertsTable).values(alertValues);
  }
  await db.insert(alertsTable).values([
    {
      type: "operations",
      severity: "info",
      message: "Monsoon advisory: West Coast lanes may see 12h delays",
      resolved: false,
    },
    {
      type: "operations",
      severity: "warning",
      message: "Driver shortage at Bengaluru South Hub",
      locationId: locations.find((l) => l.name === "Bengaluru South Hub")?.id,
      resolved: false,
    },
  ]);

  void eq;
  logger.info("Seed complete");
}

export { ensureSeeded };
