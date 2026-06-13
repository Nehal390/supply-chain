import { type Request, type Response, type NextFunction } from "express";
import { getDbAvailable } from "./db-status";
import {
  MOCK_USERS,
  MOCK_PRODUCTS,
  MOCK_LOCATIONS,
  MOCK_LOCATION_DETAILS,
  MOCK_INVENTORY,
  MOCK_SHORTAGES,
  MOCK_ORDERS,
  MOCK_ALERTS,
  MOCK_ANALYTICS_SUMMARY,
  MOCK_ANALYTICS_TRENDS,
  MOCK_ANALYTICS_DEMAND,
  MOCK_ANALYTICS_HEATMAP,
  MOCK_ANALYTICS_EFFICIENCY,
  MOCK_ANALYTICS_FORECAST,
} from "./mock-data";

const DEMO_PASSWORDS: Record<string, string> = {
  "admin@scn.in":    "demo1234",
  "manager@scn.in":  "demo1234",
  "retail@scn.in":   "demo1234",
  "customer@scn.in": "demo1234",
};

export function mockFallbackMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (getDbAvailable()) {
    next();
    return;
  }

  const { method, path } = req;
  const seg = path.replace(/^\/api/, "").replace(/\/$/, "").split("/").filter(Boolean);

  if (seg[0] === "healthz") { next(); return; }

  if (seg[0] === "auth") {
    if (seg[1] === "me" && method === "GET") {
      const uid = req.session.userId as number | undefined;
      const user = uid ? MOCK_USERS.find(u => u.id === uid) ?? null : null;
      res.json({ user });
      return;
    }
    if (seg[1] === "login" && method === "POST") {
      const { email, password } = req.body ?? {};
      const normalEmail = String(email ?? "").toLowerCase().trim();
      const user = MOCK_USERS.find(u => u.email === normalEmail);
      if (!user) { res.status(401).json({ error: "Invalid email or password" }); return; }
      const expected = DEMO_PASSWORDS[normalEmail];
      if (expected && password !== expected) { res.status(401).json({ error: "Invalid email or password" }); return; }
      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role, city: user.city, createdAt: user.createdAt });
      return;
    }
    if (seg[1] === "logout" && method === "POST") {
      req.session.destroy(() => res.sendStatus(204));
      return;
    }
    if (seg[1] === "register" && method === "POST") {
      res.status(503).json({ error: "Registration is unavailable while the database is warming up. Please try again shortly." });
      return;
    }
    next();
    return;
  }

  const WRITE_UNAVAILABLE = { error: "Database is warming up — writes are temporarily unavailable. Demo data is shown." };

  if (seg[0] === "users") {
    if (method === "GET") { res.json(MOCK_USERS); return; }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "products") {
    if (method === "GET" && seg.length === 1) { res.json(MOCK_PRODUCTS); return; }
    if (method === "GET" && seg[1]) {
      const p = MOCK_PRODUCTS.find(x => x.id === Number(seg[1]));
      if (!p) { res.status(404).json({ error: "Product not found" }); return; }
      res.json(p); return;
    }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "locations") {
    if (method === "GET" && seg.length === 1) {
      const type = req.query["type"] as string | undefined;
      const locs = type ? MOCK_LOCATIONS.filter(l => l.type === type) : MOCK_LOCATIONS;
      res.json(locs); return;
    }
    if (method === "GET" && seg[1]) {
      const detail = MOCK_LOCATION_DETAILS.find(l => l.id === Number(seg[1]));
      if (!detail) { res.status(404).json({ error: "Location not found" }); return; }
      res.json(detail); return;
    }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "inventory") {
    if (method === "GET" && seg[1] === "shortages") { res.json(MOCK_SHORTAGES); return; }
    if (method === "GET" && seg.length === 1) {
      const locId = req.query["locationId"] ? Number(req.query["locationId"]) : null;
      const prodId = req.query["productId"] ? Number(req.query["productId"]) : null;
      let rows = MOCK_INVENTORY;
      if (locId) rows = rows.filter(r => r.locationId === locId);
      if (prodId) rows = rows.filter(r => r.productId === prodId);
      res.json(rows); return;
    }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "orders") {
    if (method === "GET" && seg.length === 1) { res.json(MOCK_ORDERS); return; }
    if (method === "GET" && seg[1]) {
      const o = MOCK_ORDERS.find(x => x.id === Number(seg[1]));
      if (!o) { res.status(404).json({ error: "Order not found" }); return; }
      res.json(o); return;
    }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "alerts") {
    if (method === "GET") { res.json(MOCK_ALERTS); return; }
    res.status(503).json(WRITE_UNAVAILABLE); return;
  }

  if (seg[0] === "analytics") {
    switch (seg[1]) {
      case "summary":             res.json(MOCK_ANALYTICS_SUMMARY);    return;
      case "inventory-trends":    res.json(MOCK_ANALYTICS_TRENDS);     return;
      case "demand-by-region":    res.json(MOCK_ANALYTICS_DEMAND);     return;
      case "region-heatmap":      res.json(MOCK_ANALYTICS_HEATMAP);    return;
      case "delivery-efficiency": res.json(MOCK_ANALYTICS_EFFICIENCY); return;
      case "forecast":            res.json(MOCK_ANALYTICS_FORECAST);   return;
    }
  }

  if (seg[0] === "fulfillment" && seg[1] === "suggest" && method === "POST") {
    const { productId, deliveryLat, deliveryLng } = req.body ?? {};
    const candidates = MOCK_INVENTORY
      .filter(r => r.productId === productId && r.quantity > 0)
      .map(r => {
        const loc = MOCK_LOCATIONS.find(l => l.id === r.locationId)!;
        const dist = Math.round(Math.sqrt(Math.pow((deliveryLat - loc.lat) * 111, 2) + Math.pow((deliveryLng - loc.lng) * 91, 2)) * 10) / 10;
        return { locationId: loc.id, locationName: loc.name, locationCity: loc.city, quantity: r.quantity, distanceKm: dist, estimatedDeliveryHours: Math.ceil(dist / 60) + 4 };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
    res.json(candidates); return;
  }

  if (seg[0] === "ai" && seg[1] === "chat" && method === "POST") {
    res.json({ reply: "The AI assistant is temporarily unavailable while the database is warming up. Current network status: 18 locations active, 10 products tracked, real-time data will be available shortly." });
    return;
  }

  next();
}
