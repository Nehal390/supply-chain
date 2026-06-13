const NOW = new Date("2026-06-13T00:00:00.000Z");
const AGO = (d: number) => new Date(NOW.getTime() - d * 86400000).toISOString();

export const MOCK_USERS = [
  { id: 1, email: "admin@scn.in",    name: "Aanya Mehta",   role: "admin",    city: "Mumbai",    createdAt: AGO(47) },
  { id: 2, email: "manager@scn.in",  name: "Rohan Iyer",    role: "manager",  city: "Bengaluru", createdAt: AGO(47) },
  { id: 3, email: "retail@scn.in",   name: "Priya Nair",    role: "retail",   city: "Chennai",   createdAt: AGO(47) },
  { id: 4, email: "customer@scn.in", name: "Arjun Sharma",  role: "customer", city: "Delhi",     createdAt: AGO(47) },
];

export const MOCK_PRODUCTS = [
  { id: 1,  name: "Basmati Rice 5kg",             sku: "FOOD-RICE-5KG",   category: "Groceries",   unitPrice: 480,  imageUrl: null },
  { id: 2,  name: "Cold-Pressed Mustard Oil 1L",  sku: "FOOD-OIL-MUST-1L",category: "Groceries",   unitPrice: 260,  imageUrl: null },
  { id: 3,  name: "ORS Pack (10 sachets)",         sku: "MED-ORS-10",      category: "Pharma",      unitPrice: 180,  imageUrl: null },
  { id: 4,  name: "Paracetamol 500mg (strip)",     sku: "MED-PARA-500",    category: "Pharma",      unitPrice: 35,   imageUrl: null },
  { id: 5,  name: "School Notebook (200pg)",       sku: "STAT-NB-200",     category: "Stationery",  unitPrice: 90,   imageUrl: null },
  { id: 6,  name: "LED Bulb 9W",                   sku: "ELEC-LED-9W",     category: "Electronics", unitPrice: 140,  imageUrl: null },
  { id: 7,  name: "Cotton T-Shirt",                sku: "APP-CTN-TS",      category: "Apparel",     unitPrice: 320,  imageUrl: null },
  { id: 8,  name: "Power Bank 10000mAh",           sku: "ELEC-PB-10K",     category: "Electronics", unitPrice: 1450, imageUrl: null },
  { id: 9,  name: "Reusable Water Bottle",         sku: "HOME-BOT-1L",     category: "Home",        unitPrice: 220,  imageUrl: null },
  { id: 10, name: "Hand Sanitizer 500ml",          sku: "MED-SAN-500",     category: "Pharma",      unitPrice: 175,  imageUrl: null },
];

const LOCS_BASE = [
  { id: 1,  name: "Mumbai Central Hub",        type: "warehouse", city: "Mumbai",    state: "Maharashtra",  address: "Dharavi Industrial Estate, Mumbai",       lat: 19.076,  lng: 72.8777, capacity: 12000, contactName: "Vikram Joshi",       contactPhone: "+91 98200 11122" },
  { id: 2,  name: "Bandra Local Partner Shop", type: "micro",     city: "Mumbai",    state: "Maharashtra",  address: "Linking Road, Bandra West",                lat: 19.0596, lng: 72.8295, capacity: 1800,  contactName: null, contactPhone: null },
  { id: 3,  name: "Andheri Local Partner Shop",type: "micro",     city: "Mumbai",    state: "Maharashtra",  address: "MIDC, Andheri East",                       lat: 19.1197, lng: 72.8468, capacity: 1500,  contactName: null, contactPhone: null },
  { id: 4,  name: "Delhi NCR Hub",             type: "warehouse", city: "Delhi",     state: "Delhi",        address: "Okhla Phase II, New Delhi",                lat: 28.5355, lng: 77.391,  capacity: 11000, contactName: "Neha Kapoor",        contactPhone: "+91 99100 22233" },
  { id: 5,  name: "Saket Local Partner Shop",  type: "micro",     city: "Delhi",     state: "Delhi",        address: "Saket District Centre",                    lat: 28.5245, lng: 77.2066, capacity: 1600,  contactName: null, contactPhone: null },
  { id: 6,  name: "Gurugram Local Partner Shop",type:"micro",     city: "Gurugram",  state: "Haryana",      address: "Cyber City Phase III",                     lat: 28.4946, lng: 77.0892, capacity: 1700,  contactName: null, contactPhone: null },
  { id: 7,  name: "Bengaluru South Hub",       type: "warehouse", city: "Bengaluru", state: "Karnataka",    address: "Electronics City, Phase 1",                lat: 12.8456, lng: 77.6603, capacity: 10000, contactName: "Karthik Rao",        contactPhone: "+91 98800 33344" },
  { id: 8,  name: "Indiranagar Local Partner Shop", type: "micro",city: "Bengaluru", state: "Karnataka",    address: "100 Feet Road, Indiranagar",               lat: 12.9719, lng: 77.6412, capacity: 1500,  contactName: null, contactPhone: null },
  { id: 9,  name: "Whitefield Local Partner Shop",  type: "micro",city: "Bengaluru", state: "Karnataka",    address: "ITPL Main Road, Whitefield",               lat: 12.9698, lng: 77.7499, capacity: 1400,  contactName: null, contactPhone: null },
  { id: 10, name: "Chennai Port Hub",          type: "warehouse", city: "Chennai",   state: "Tamil Nadu",   address: "Manali Industrial Area",                   lat: 13.1707, lng: 80.2587, capacity: 9000,  contactName: "Lakshmi Narayanan",  contactPhone: "+91 98400 44455" },
  { id: 11, name: "T. Nagar Local Partner Shop",    type: "micro",city: "Chennai",   state: "Tamil Nadu",   address: "Pondy Bazaar, T. Nagar",                   lat: 13.0418, lng: 80.2341, capacity: 1300,  contactName: null, contactPhone: null },
  { id: 12, name: "Hyderabad Hub",             type: "warehouse", city: "Hyderabad", state: "Telangana",    address: "Patancheru Industrial Estate",              lat: 17.5314, lng: 78.2622, capacity: 8500,  contactName: "Sneha Reddy",        contactPhone: "+91 96400 55566" },
  { id: 13, name: "HITEC City Local Partner Shop",  type: "micro",city: "Hyderabad", state: "Telangana",    address: "HITEC City, Madhapur",                     lat: 17.4474, lng: 78.3762, capacity: 1500,  contactName: null, contactPhone: null },
  { id: 14, name: "Kolkata East Hub",          type: "warehouse", city: "Kolkata",   state: "West Bengal",  address: "Salt Lake Sector V",                       lat: 22.5726, lng: 88.4324, capacity: 8000,  contactName: "Debashish Bose",     contactPhone: "+91 98300 66677" },
  { id: 15, name: "Park Street Local Partner Shop", type: "micro",city: "Kolkata",   state: "West Bengal",  address: "Park Street",                              lat: 22.5535, lng: 88.3517, capacity: 1200,  contactName: null, contactPhone: null },
  { id: 16, name: "Pune Local Partner Shop",   type: "micro",     city: "Pune",      state: "Maharashtra",  address: "Hinjawadi Phase II",                       lat: 18.5908, lng: 73.7372, capacity: 1600,  contactName: null, contactPhone: null },
  { id: 17, name: "Ahmedabad Local Partner Shop", type: "micro",  city: "Ahmedabad", state: "Gujarat",      address: "SG Highway",                               lat: 23.0362, lng: 72.5066, capacity: 1500,  contactName: null, contactPhone: null },
  { id: 18, name: "Jaipur Local Partner Shop", type: "micro",     city: "Jaipur",    state: "Rajasthan",    address: "Malviya Nagar Industrial Area",             lat: 26.8506, lng: 75.806,  capacity: 1300,  contactName: null, contactPhone: null },
];

function det(seed: number, mod: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0) % mod;
}

export const MOCK_INVENTORY = (() => {
  const rows: {
    id: number; productId: number; locationId: number; quantity: number; threshold: number;
    productName: string; productSku: string; productCategory: string; locationName: string; locationCity: string;
  }[] = [];
  let id = 1;
  for (const loc of LOCS_BASE) {
    const isWarehouse = loc.type === "warehouse";
    for (const prod of MOCK_PRODUCTS) {
      if (!isWarehouse && det(id * 31 + loc.id, 4) === 0) { id++; continue; }
      const threshold = isWarehouse ? 100 : 25;
      const shortage = det(id * 17, 100) < 15;
      const quantity = shortage
        ? Math.floor(threshold * det(id, 6) / 10)
        : isWarehouse
          ? 200 + det(id * 37, 600)
          : 30 + det(id * 13, 90);
      rows.push({
        id, productId: prod.id, locationId: loc.id, quantity, threshold,
        productName: prod.name, productSku: prod.sku, productCategory: prod.category,
        locationName: loc.name, locationCity: loc.city,
      });
      id++;
    }
  }
  return rows;
})();

function statsFor(locationId: number, capacity: number) {
  const rows = MOCK_INVENTORY.filter(r => r.locationId === locationId);
  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  const distinctSkus = new Set(rows.map(r => r.productId)).size;
  const utilizationPct = capacity > 0 ? Math.min(100, Math.round((totalUnits / capacity) * 1000) / 10) : 0;
  const pct = capacity > 0 ? totalUnits / capacity : 1;
  const stockStatus = pct < 0.2 ? "critical" : pct < 0.45 ? "low" : "healthy";
  return { totalUnits, distinctSkus, utilizationPct, stockStatus };
}

export const MOCK_LOCATIONS = LOCS_BASE.map(loc => ({
  ...loc,
  createdAt: AGO(47),
  ...statsFor(loc.id, loc.capacity),
}));

export const MOCK_LOCATION_DETAILS = LOCS_BASE.map(loc => ({
  ...loc,
  createdAt: AGO(47),
  ...statsFor(loc.id, loc.capacity),
  inventory: MOCK_INVENTORY.filter(r => r.locationId === loc.id),
}));

export const MOCK_SHORTAGES = (() => {
  const short = MOCK_INVENTORY.filter(r => r.quantity < r.threshold);
  return short.map(s => {
    const loc = LOCS_BASE.find(l => l.id === s.locationId)!;
    const candidates = MOCK_INVENTORY.filter(
      r => r.productId === s.productId && r.quantity >= r.threshold && r.locationId !== s.locationId,
    );
    let nearest: { locationId: number; locationName: string; locationCity: string; distanceKm: number; quantity: number } | null = null;
    for (const c of candidates) {
      const cloc = LOCS_BASE.find(l => l.id === c.locationId)!;
      const dist = Math.round(Math.sqrt(Math.pow((loc.lat - cloc.lat) * 111, 2) + Math.pow((loc.lng - cloc.lng) * 91, 2)) * 10) / 10;
      if (!nearest || dist < nearest.distanceKm) {
        nearest = { locationId: c.locationId, locationName: c.locationName, distanceKm: dist, quantity: c.quantity, locationCity: cloc.city };
      }
    }
    return {
      id: s.id,
      productId: s.productId,
      locationId: s.locationId,
      quantity: s.quantity,
      threshold: s.threshold,
      productName: s.productName,
      productSku: s.productSku,
      productCategory: s.productCategory,
      locationName: s.locationName,
      locationCity: s.locationCity,
      locationState: loc.state,
      shortfall: Math.max(0, s.threshold - s.quantity),
      nearestAlternativeName: nearest ? nearest.locationName : null,
      nearestAlternativeDistanceKm: nearest ? nearest.distanceKm : null,
      nearestAlternativeQuantity: nearest ? nearest.quantity : null,
      nearestAlternativeLocationId: nearest ? nearest.locationId : null,
      nearestAlternativeCity: nearest ? nearest.locationCity : null,
    };
  });
})();

const ORDER_STATUSES = ["pending", "dispatched", "in_transit", "delivered", "cancelled"] as const;
export const MOCK_ORDERS = (() => {
  const orders = [];
  for (let i = 1; i <= 60; i++) {
    const daysAgo = det(i * 7, 30);
    const prodIdx = det(i * 3, 10);
    const locIdx = det(i * 11, 18);
    const prod = MOCK_PRODUCTS[prodIdx]!;
    const loc = LOCS_BASE[locIdx]!;
    let status: string;
    if (daysAgo > 5) status = det(i, 100) < 85 ? "delivered" : "cancelled";
    else if (daysAgo > 2) status = det(i, 100) < 60 ? "delivered" : "in_transit";
    else status = det(i, 100) < 50 ? "in_transit" : det(i, 100) < 75 ? "dispatched" : "pending";
    orders.push({
      id: i,
      customerId: 4,
      productId: prod.id,
      quantity: 1 + det(i * 5, 6),
      sourceLocationId: loc.id,
      status,
      estimatedDeliveryHours: 8 + det(i * 13, 40),
      distanceKm: 50 + det(i * 17, 800),
      createdAt: AGO(daysAgo),
      customerName: "Arjun Sharma",
      productName: prod.name,
      sourceLocationName: loc.name,
    });
  }
  return orders;
})();

export const MOCK_ALERTS = (() => {
  const alerts = MOCK_SHORTAGES.slice(0, 12).map((s, i) => ({
    id: i + 1,
    type: "shortage",
    severity: s.quantity < s.threshold * 0.4 ? "critical" : "warning",
    message: `Stock at ${s.quantity} units (threshold ${s.threshold})`,
    locationId: s.locationId,
    productId: s.productId,
    resolved: false,
    createdAt: AGO(det(i * 7, 14)),
    locationName: s.locationName,
    productName: s.productName,
  }));
  alerts.push(
    { id: 13, type: "operations", severity: "info",    message: "Monsoon advisory: West Coast lanes may see 12h delays",   locationId: null as any, productId: null as any, resolved: false, createdAt: AGO(2), locationName: null as any, productName: null as any },
    { id: 14, type: "operations", severity: "warning", message: "Driver shortage at Bengaluru South Hub",                  locationId: 7,           productId: null as any, resolved: false, createdAt: AGO(1), locationName: "Bengaluru South Hub", productName: null as any },
  );
  return alerts;
})();

export const MOCK_ANALYTICS_SUMMARY = (() => {
  const totalUnits = MOCK_INVENTORY.reduce((s, r) => s + r.quantity, 0);
  const criticalShortages = MOCK_INVENTORY.filter(r => r.quantity < r.threshold).length;
  const deliveredOrders30d = MOCK_ORDERS.filter(o => o.status === "delivered").length;
  const openOrders = MOCK_ORDERS.filter(o => ["pending","dispatched","in_transit"].includes(o.status)).length;
  const byStatusMap = new Map<string, number>();
  for (const o of MOCK_ORDERS) byStatusMap.set(o.status, (byStatusMap.get(o.status) ?? 0) + 1);
  const ordersByStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count }));
  const avgDeliveryHours = Math.round(MOCK_ORDERS.reduce((s, o) => s + o.estimatedDeliveryHours, 0) / MOCK_ORDERS.length * 10) / 10;
  return {
    totalLocations: LOCS_BASE.length,
    totalWarehouses: LOCS_BASE.filter(l => l.type === "warehouse").length,
    totalMicroWarehouses: LOCS_BASE.filter(l => l.type === "micro").length,
    totalProducts: MOCK_PRODUCTS.length,
    totalUnits,
    criticalShortages,
    openOrders,
    deliveredOrders30d,
    ordersByStatus,
    avgDeliveryHours,
  };
})();

export const MOCK_ANALYTICS_TRENDS = (() => {
  const points = [];
  const base = MOCK_ANALYTICS_SUMMARY.totalUnits;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - i);
    const noise = Math.sin(i / 2) * 180;
    points.push({
      date: d.toISOString().slice(0, 10),
      totalUnits: Math.max(0, Math.round(base + noise - i * 12)),
      criticalCount: Math.max(0, Math.round(MOCK_ANALYTICS_SUMMARY.criticalShortages + Math.sin(i / 2) * 4 - i * 0.2)),
    });
  }
  return points;
})();

export const MOCK_ANALYTICS_DEMAND = (() => {
  const map = new Map<string, { orderCount: number; totalUnits: number }>();
  for (const o of MOCK_ORDERS) {
    const loc = LOCS_BASE.find(l => l.id === o.sourceLocationId);
    if (!loc) continue;
    const cur = map.get(loc.state) ?? { orderCount: 0, totalUnits: 0 };
    map.set(loc.state, { orderCount: cur.orderCount + 1, totalUnits: cur.totalUnits + o.quantity });
  }
  return Array.from(map.entries())
    .map(([state, v]) => ({ state, ...v }))
    .sort((a, b) => b.orderCount - a.orderCount);
})();

export const MOCK_ANALYTICS_HEATMAP = (() => {
  const map = new Map<string, { healthy: number; low: number; critical: number }>();
  for (const r of MOCK_INVENTORY) {
    const loc = LOCS_BASE.find(l => l.id === r.locationId);
    if (!loc) continue;
    const cell = map.get(loc.state) ?? { healthy: 0, low: 0, critical: 0 };
    if (r.quantity < r.threshold * 0.4) cell.critical += 1;
    else if (r.quantity < r.threshold) cell.low += 1;
    else cell.healthy += 1;
    map.set(loc.state, cell);
  }
  return Array.from(map.entries()).map(([state, v]) => ({ state, ...v }));
})();

export const MOCK_ANALYTICS_EFFICIENCY = (() => {
  const delivered = MOCK_ORDERS.filter(o => o.status === "delivered");
  const onTime = delivered.filter(o => o.estimatedDeliveryHours <= 24);
  const onTimePct = delivered.length > 0 ? Math.round(onTime.length / delivered.length * 1000) / 10 : 0;
  const avgDistanceKm = delivered.length > 0 ? Math.round(delivered.reduce((s, o) => s + o.distanceKm, 0) / delivered.length * 10) / 10 : 0;
  const avgHours = delivered.length > 0 ? Math.round(delivered.reduce((s, o) => s + o.estimatedDeliveryHours, 0) / delivered.length * 10) / 10 : 0;
  const byDay = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - i);
    byDay.push({ date: d.toISOString().slice(0, 10), onTimePct: Math.max(60, onTimePct + Math.sin(i) * 8), avgHours: Math.max(10, avgHours + Math.cos(i) * 3) });
  }
  return { onTimePct, avgDistanceKm, avgHours, byDay };
})();

export const MOCK_ANALYTICS_FORECAST = MOCK_PRODUCTS.map(p => {
  const productOrders = MOCK_ORDERS.filter(o => o.productId === p.id);
  const baseDaily = productOrders.length > 0 ? productOrders.reduce((s, o) => s + o.quantity, 0) / 14 : 3;
  const forecast = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(NOW);
    d.setDate(d.getDate() + i + 1);
    const dow = d.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.25 : 1;
    const noise = 1 + Math.sin((p.id + i) * 0.7) * 0.1;
    return { date: d.toISOString().slice(0, 10), expectedDemand: Math.max(0, Math.round(baseDaily * weekendBoost * noise)) };
  });
  return { productId: p.id, productName: p.name, forecast };
});
