import { createContext, useContext } from "react";
import type { L } from "./defaults";
import { list, save, uid } from "./db";

export type Lang = "fr" | "en";
export const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "fr", setLang: () => {} });
export const useLang = () => useContext(LangCtx);
export const tr = (v: L | undefined, lang: Lang) => (v ? v[lang] || v.fr : "");

const T = {
  home: ["Accueil", "Home"], services: ["Services", "Services"], portfolio: ["Portfolio", "Portfolio"], team: ["Équipe", "Team"], contact: ["Contact", "Contact"],
  quote: ["Demander un devis", "Request a quote"], tag: ["Agence de développement digital", "Digital development agency"],
  discover: ["Découvrir nos projets", "Discover our projects"], contactUs: ["Nous contacter", "Contact us"],
  featured: ["Nos réalisations en vedette", "Featured projects"], featuredSub: ["Quelques projets qui illustrent notre expertise.", "A few projects that showcase our expertise."],
  seeAll: ["Voir tout", "See all"], visit: ["Visiter le projet", "Visit project"], details: ["Voir les détails", "View details"],
  ourServices: ["Nos services", "Our services"], servicesSub: ["Des solutions sur mesure pour faire grandir votre projet.", "Tailored solutions to grow your project."],
  about: ["À propos de nous", "About us"], why: ["Pourquoi choisir CODE DEVS DIGITAL ?", "Why choose CODE DEVS DIGITAL?"],
  aboutText: ["Nous combinons créativité, expertise technique et sens du détail pour livrer des solutions digitales modernes, sécurisées et adaptées à vos objectifs.", "We combine creativity, technical expertise and attention to detail to deliver modern, secure digital solutions tailored to your goals."],
  values: ["Qualité|Transparence|Innovation|Proximité", "Quality|Transparency|Innovation|Proximity"],
  process: ["Notre processus", "Our process"], steps: ["Échange|Analyse|Devis|Maquette|Développement|Tests|Livraison|Maintenance", "Discussion|Analysis|Quote|Mockup|Development|Testing|Delivery|Maintenance"],
  tech: ["Technologies maîtrisées", "Technologies we master"], reviews: ["Avis clients", "Client reviews"], leaveReview: ["Laisser un avis", "Leave a review"],
  noReviews: ["Aucun avis pour le moment. Soyez le premier !", "No reviews yet. Be the first!"],
  news: ["Actualités", "News & updates"], all: ["Tous", "All"], tech2: ["Technologies", "Technologies"], features: ["Fonctionnalités", "Features"],
  send: ["Envoyer ma demande", "Send my request"], sent: ["Votre demande a bien été enregistrée. Nous vous recontactons rapidement.", "Your request has been saved. We'll get back to you shortly."],
  support: ["Support", "Support"], legal: ["Pages légales", "Legal"], privacy: ["Confidentialité", "Privacy"], mentions: ["Mentions légales", "Legal notice"], terms: ["Conditions d'utilisation", "Terms of use"],
  rights: ["Tous droits réservés.", "All rights reserved."], notConfigured: ["À configurer", "To be configured"],
};
export type TKey = keyof typeof T;
export const t = (k: TKey, lang: Lang) => T[k][lang === "fr" ? 0 : 1];

// ---------- Push notifications (Service Worker + Notification API) ----------
export async function enablePush(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  const p = await Notification.requestPermission();
  if (p !== "granted") return false;
  if ("serviceWorker" in navigator) await navigator.serviceWorker.register("/sw.js").catch(() => {});
  localStorage.setItem("cdd_push", "1");
  return true;
}
export async function showPush(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (reg) reg.showNotification(title, { body, icon: "/icon-192.png" });
  else new Notification(title, { body });
}

// ---------- AI (Groq) ----------
export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };
export async function askAI(messages: ChatMsg[], settings: { groqKey: string; groqModel: string; aiPrompt: string }, context: string): Promise<string> {
  const payload = { model: settings.groqModel || "llama-3.3-70b-versatile", temperature: 0.5, messages: [{ role: "system", content: settings.aiPrompt + "\n\nContexte:\n" + context }, ...messages] };
  // 1) Vercel serverless proxy (keeps key server-side when GROQ_API_KEY is set)
  try {
    const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.ok && r.headers.get("content-type")?.includes("json")) { const j = await r.json(); if (j.reply) return j.reply; }
  } catch { /* fall through */ }
  // 2) Key configured from the admin dashboard
  if (!settings.groqKey) throw new Error("no-key");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.groqKey}` }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error("ai-error");
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

/** Extract contact details the user shares with the AI and store them as a lead. */
export async function captureLead(text: string) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
  const phone = text.match(/\+?\d[\d\s-]{7,}\d/)?.[0];
  if (!email && !phone) return;
  const leads = await list<any>("leads").catch(() => [] as any[]);
  const existing = leads.find((l) => (email && l.email === email) || (phone && l.whatsapp === phone));
  await save("leads", { ...(existing || { id: uid(), source: "ai-chat" }), email: email || existing?.email, whatsapp: phone || existing?.whatsapp, need: (existing?.need ? existing.need + " | " : "") + text.slice(0, 300) });
}

export const genKey = () => "CDD-" + Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 6).toUpperCase()).join("-");
