import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import {
  db,
  inventoryTable,
  locationsTable,
  productsTable,
  ordersTable,
  alertsTable,
} from "@workspace/db";
import { AiChatBody } from "@workspace/api-zod";
import { openai, aiAvailable } from "../lib/openai";

const router: IRouter = Router();

async function gatherSnapshot() {
  const [units] = await db
    .select({ s: sql<number>`coalesce(sum(${inventoryTable.quantity}),0)::int` })
    .from(inventoryTable);
  const [critical] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inventoryTable)
    .where(sql`${inventoryTable.quantity} < ${inventoryTable.threshold}`);
  const [locs] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(locationsTable);
  const [prods] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable);
  const [open] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} <> 'delivered' and ${ordersTable.status} <> 'cancelled'`);
  const [activeAlerts] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(alertsTable)
    .where(sql`${alertsTable.resolved} = false`);
  return {
    totalUnits: units?.s ?? 0,
    criticalShortages: critical?.c ?? 0,
    totalLocations: locs?.c ?? 0,
    totalProducts: prods?.c ?? 0,
    openOrders: open?.c ?? 0,
    activeAlerts: activeAlerts?.c ?? 0,
  };
}

function fallbackReply(
  message: string,
  snap: Awaited<ReturnType<typeof gatherSnapshot>>,
) {
  const m = message.toLowerCase();
  if (m.includes("shortage") || m.includes("low stock")) {
    return `There are currently ${snap.criticalShortages} inventory rows below threshold across the network. Open the Shortages page to see each item with its nearest restock source.`;
  }
  if (m.includes("alert")) {
    return `${snap.activeAlerts} active alerts are open right now. Visit Alerts to review and resolve them.`;
  }
  if (m.includes("order")) {
    return `${snap.openOrders} orders are still in motion (pending, dispatched, or in transit). Each new order auto-routes to the nearest source with stock.`;
  }
  return `Network snapshot: ${snap.totalLocations} locations holding ${snap.totalUnits} units across ${snap.totalProducts} SKUs. ${snap.criticalShortages} shortages and ${snap.activeAlerts} active alerts are open.`;
}

const SUGGESTIONS = [
  "Where are my biggest stock shortages right now?",
  "Which orders are taking the longest to deliver?",
  "Show me regions with the worst stock health",
  "What can I do to reduce critical shortages?",
];

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const snap = await gatherSnapshot();
  const systemPrompt = `You are the Smart Supply Chain assistant for an Indian micro-warehouse logistics platform.
Network snapshot:
- Locations: ${snap.totalLocations}
- SKUs: ${snap.totalProducts}
- Total units in stock: ${snap.totalUnits}
- Inventory rows below threshold (shortages): ${snap.criticalShortages}
- Open orders: ${snap.openOrders}
- Active alerts: ${snap.activeAlerts}
Be concise, actionable, and specific. Cite the snapshot numbers when relevant. Avoid emojis. Limit responses to 4 short paragraphs.`;

  if (aiAvailable && openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          ...(parsed.data.history ?? []).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: parsed.data.message },
        ],
      });
      const reply =
        completion.choices[0]?.message?.content?.trim() ??
        fallbackReply(parsed.data.message, snap);
      res.json({ reply, suggestions: SUGGESTIONS });
      return;
    } catch (err) {
      req.log.warn({ err }, "OpenAI call failed, using fallback");
    }
  }

  res.json({
    reply: fallbackReply(parsed.data.message, snap),
    suggestions: SUGGESTIONS,
  });
});

export default router;
