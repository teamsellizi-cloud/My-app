import crypto from "node:crypto";
import { rest, SERVICE, SUPA_URL } from "./_supa.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!SERVICE || !SUPA_URL) return res.status(503).json({ error: "not-configured" });
  const { subscription, ticketKeys } = req.body || {};
  if (!subscription?.endpoint || !subscription?.keys?.p256dh) return res.status(400).json({ error: "bad-subscription" });
  const id = crypto.createHash("sha256").update(subscription.endpoint).digest("hex").slice(0, 32);
  const keys = Array.isArray(ticketKeys) ? ticketKeys.filter((k) => typeof k === "string").slice(0, 50) : [];
  const r = await rest("push_subs", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id, data: { subscription, ticketKeys: keys } }) });
  return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
