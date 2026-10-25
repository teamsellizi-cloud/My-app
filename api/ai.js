// Vercel Serverless Function — Groq proxy.
// Uses GROQ_API_KEY env var, or falls back to the key saved in the admin dashboard (settings table, read with the service role key).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    let key = process.env.GROQ_API_KEY;
    if (!key && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_URL) {
      const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/secrets?id=eq.groq&select=data`, {
        headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      });
      const rows = await r.json();
      key = rows?.[0]?.data?.key;
    }
    if (!key) return res.status(503).json({ error: "no-key" });
    const { model, messages, temperature } = req.body || {};
    if (!Array.isArray(messages) || messages.length > 30) return res.status(400).json({ error: "bad-request" });
    const g = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: model || "llama-3.3-70b-versatile", messages, temperature: temperature ?? 0.5, max_tokens: 700 }),
    });
    const j = await g.json();
    if (!g.ok) return res.status(502).json({ error: j?.error?.message || "groq-error" });
    return res.status(200).json({ reply: j.choices?.[0]?.message?.content || "" });
  } catch (e) {
    return res.status(500).json({ error: "server-error" });
  }
}
