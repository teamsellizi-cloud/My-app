import webpush from "web-push";
import { rest, SERVICE, SUPA_URL } from "./_supa.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!SERVICE || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return res.status(503).json({ error: "not-configured" });
  // Only authenticated admins (Supabase Auth) may send
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const u = await fetch(`${SUPA_URL}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${token}` } });
  if (!u.ok) return res.status(401).json({ error: "unauthorized" });

  webpush.setVapidDetails(VAPID_SUBJECT || "mailto:admin@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const { title, body, ticketKey, url } = req.body || {};
  const subs = await (await rest("push_subs?select=id,data")).json();
  const targets = (subs || []).filter((s) => !ticketKey || (s.data.ticketKeys || []).includes(ticketKey));
  const payload = JSON.stringify({ title: title || "CODE DEVS DIGITAL", body: body || "", url: url || (ticketKey ? "/#/support" : "/") });
  let sent = 0;
  await Promise.all(targets.map(async (s) => {
    try { await webpush.sendNotification(s.data.subscription, payload); sent++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await rest(`push_subs?id=eq.${s.id}`, { method: "DELETE" }); }
  }));
  return res.status(200).json({ ok: true, sent, total: targets.length });
}
