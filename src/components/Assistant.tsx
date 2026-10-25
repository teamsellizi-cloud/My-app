import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Send, X, FileText, LifeBuoy, ArrowRight, Check, Copy, RotateCcw, Briefcase, FolderOpen, Users } from "lucide-react";
import { useTable, useSettings, save, bookedSlots } from "../lib/db";
import { SLOTS, bookableDays } from "./Requests";
import { askAI, captureLead, ChatMsg, genKey, useLang } from "../lib/app";
import { subscribePush } from "../lib/push";
import type { Project, Service, Member } from "../lib/defaults";
import { LogoMark } from "./ui";

/** Clean, professional assistant icon: chat bubble with a spark. */
export function AssistantIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12.5c0 3.9-3.6 7-8 7-1.2 0-2.3-.2-3.3-.6L4 20l1.2-3.6C4.4 15.3 4 14 4 12.5c0-3.9 3.6-7 8-7" />
      <path d="M17.5 3l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="12.5" r=".6" fill="currentColor" /><circle cx="12" cy="12.5" r=".6" fill="currentColor" /><circle cx="15.5" cy="12.5" r=".6" fill="currentColor" />
    </svg>
  );
}

export const openAssistant = (prompt?: string) => window.dispatchEvent(new CustomEvent("cdd-open-ai", { detail: prompt }));

type Action = { type: "quote" | "ticket" | "navigate" | "lead" | "meeting"; [k: string]: any };
type UIMsg = ChatMsg & { actions?: Action[]; done?: Record<number, string> };

const ACTION_GUIDE = `
OUTILS: Tu peux proposer des actions en ajoutant, à la fin de ta réponse, une ou plusieurs lignes exactement au format:
<<ACTION {"type":"quote","name":"...","company":"...","email":"...","whatsapp":"...","service":"...","budget":"...","deadline":"...","description":"..."}>>
<<ACTION {"type":"ticket","name":"...","email":"...","subject":"...","message":"..."}>>
<<ACTION {"type":"meeting","name":"...","email":"...","whatsapp":"...","company":"...","date":"YYYY-MM-DD","time":"HH:MM","mode":"video|phone|onsite","topic":"...","notes":"..."}>>
<<ACTION {"type":"navigate","page":"services|portfolio|team|partners|contact|booking|partnership|reviews|support"}>>
<<ACTION {"type":"lead","name":"...","email":"...","whatsapp":"...","need":"..."}>>
Règles: pour "quote", collecte d'abord au minimum nom, e-mail et une description d'au moins 20 caractères, puis propose l'action; l'utilisateur la confirmera. Pour "ticket": nom, sujet et message. Pour "meeting" (prise de rendez-vous): collecte nom, e-mail, sujet, mode (visio/appel/présentiel) puis propose uniquement une date et une heure DISPONIBLES listées dans DISPONIBILITÉS; si l'utilisateur demande un créneau pris ou hors liste, propose les plus proches disponibles. Utilise le format de date YYYY-MM-DD et l'heure HH:MM. Dès que l'utilisateur donne nom/e-mail/WhatsApp, ajoute une action "lead". N'affiche jamais le JSON autrement que dans ces lignes.`;

function parse(text: string): { clean: string; actions: Action[] } {
  const actions: Action[] = [];
  const clean = text.replace(/<<ACTION\s*(\{[\s\S]*?\})\s*>>/g, (_, j) => { try { actions.push(JSON.parse(j)); } catch { /* ignore */ } return ""; }).trim();
  return { clean, actions };
}

function Md({ text }: { text: string }) {
  // minimal markdown: **bold**, lists, line breaks
  return <>{text.split("\n").map((line, i) => {
    const li = /^\s*[-*•]\s+/.test(line);
    const html = line.replace(/^\s*[-*•]\s+/, "").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/&/g, "&amp;").replace(/<(?!\/?b>)/g, "&lt;");
    return li ? <div key={i} className="flex gap-2"><span className="text-blue-500">•</span><span dangerouslySetInnerHTML={{ __html: html }} /></div> : <p key={i} className={line ? "" : "h-2"} dangerouslySetInnerHTML={{ __html: html }} />;
  })}</>;
}

export default function Assistant() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const s = useSettings();
  const { rows: projects } = useTable<Project>("projects");
  const { rows: services } = useTable<Service>("services");
  const { rows: team } = useTable<Member>("team");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<UIMsg[]>(() => JSON.parse(sessionStorage.getItem("cdd_ai2") || "[]"));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { sessionStorage.setItem("cdd_ai2", JSON.stringify(msgs)); end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    const h = (e: Event) => { setOpen(true); const p = (e as CustomEvent).detail; if (p) setText(p); setTimeout(() => inputRef.current?.focus(), 300); };
    addEventListener("cdd-open-ai", h); return () => removeEventListener("cdd-open-ai", h);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);

  if (!s.aiEnabled) return null;

  const context = [
    `Agence: ${s.agencyName}. Slogan: ${s.slogan.fr}. Signature: Du code aux solutions. Localisation: ${s.location}. Horaires: ${s.hours.fr}. WhatsApp: ${s.whatsapp || "non communiqué"}. E-mail: ${s.email || "non communiqué"}.`,
    "Services: " + services.map((x) => `${x.title.fr} (${x.description.fr})`).join("; "),
    "Projets: " + projects.map((p) => `${p.name} [${p.category}] ${p.url} - ${p.description.fr}`).join("; "),
    "Équipe: " + team.map((m) => `${m.name} - ${m.role.fr}: ${m.bio.fr}`).join("; "),
    `Processus: échange, analyse, devis, maquette, développement, tests, livraison, maintenance. Langue de l'interface: ${lang}.`,
    ACTION_GUIDE,
  ].join("\n");

  const availability = async () => {
    const days = bookableDays(14);
    const lines = await Promise.all(days.map(async (d) => {
      const taken = await bookedSlots(d).catch(() => [] as string[]);
      const free = SLOTS.filter((x) => !taken.includes(x));
      const label = new Date(d + "T00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      return `${d} (${label}): ${free.length ? free.join(", ") : "complet"}`;
    }));
    return `\nDate du jour: ${new Date().toISOString().slice(0, 10)}. DISPONIBILITÉS (heure du Cameroun, 30 min, lundi–samedi):\n` + lines.join("\n");
  };

  const send = async (q0?: string) => {
    const q = (q0 ?? text).trim();
    if (!q || busy) return;
    const next: UIMsg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next); setText(""); setBusy(true);
    captureLead(q).catch(() => {});
    try {
      const wantsMeeting = /rendez|rdv|meeting|réserv|reserv|book|schedul|appel|call|créneau|slot|disponib|available|planifi/i.test(next.slice(-6).map((m) => m.content).join(" "));
      const reply = await askAI(next.slice(-14).map(({ role, content }) => ({ role, content })), s, context + (wantsMeeting ? await availability() : ""));
      const { clean, actions } = parse(reply);
      const leads = actions.filter((a) => a.type === "lead");
      leads.forEach((l) => save("leads", { name: l.name, email: l.email, whatsapp: l.whatsapp, need: l.need, source: "ai-chat" }).catch(() => {}));
      setMsgs([...next, { role: "assistant", content: clean || "…", actions: actions.filter((a) => a.type !== "lead") }]);
    } catch (err: any) {
      setMsgs([...next, { role: "assistant", content: err?.message === "no-key" ? (fr ? "L'assistant IA n'est pas encore configuré. Vous pouvez demander un devis ou ouvrir un ticket de support." : "The AI assistant isn't configured yet. You can request a quote or open a support ticket.") : (fr ? "Désolé, une erreur est survenue. Réessayez." : "Sorry, something went wrong. Please retry."), actions: [{ type: "navigate", page: "contact" }, { type: "navigate", page: "support" }] }]);
    } finally { setBusy(false); }
  };

  const markDone = (mi: number, ai: number, note: string) => setMsgs((m) => m.map((x, i) => (i === mi ? { ...x, done: { ...(x.done || {}), [ai]: note } } : x)));

  const run = async (a: Action, mi: number, ai: number) => {
    try {
      if (a.type === "navigate") { location.hash = "#/" + a.page; setOpen(false); return; }
      if (a.type === "quote") {
        if (!a.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email || "") || (a.description || "").length < 20) return markDone(mi, ai, fr ? "⚠️ Informations incomplètes (nom, e-mail, description)." : "⚠️ Missing info (name, email, description).");
        await save("quotes", { name: a.name, company: a.company || "", email: a.email, whatsapp: a.whatsapp || "", service: a.service || "—", budget: a.budget || "", deadline: a.deadline || "", description: a.description, status: "new", source: "ai" });
        markDone(mi, ai, fr ? "✓ Demande de devis enregistrée. L'équipe vous recontacte rapidement." : "✓ Quote request saved. The team will contact you soon.");
      }
      if (a.type === "meeting") {
        if (!a.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email || "")) return markDone(mi, ai, fr ? "⚠️ Nom et e-mail valides requis." : "⚠️ Valid name and email required.");
        if (!bookableDays(21).includes(a.date) || !SLOTS.includes(a.time)) return markDone(mi, ai, fr ? "⚠️ Date ou heure invalide. Demandez-moi les créneaux disponibles." : "⚠️ Invalid date or time. Ask me for available slots.");
        const taken = await bookedSlots(a.date);
        if (taken.includes(a.time)) return markDone(mi, ai, fr ? "⚠️ Ce créneau vient d'être réservé. Demandez-moi un autre horaire." : "⚠️ This slot was just booked. Ask me for another time.");
        await save("meetings", { name: a.name, email: a.email, whatsapp: a.whatsapp || "", company: a.company || "", mode: ["video", "phone", "onsite"].includes(a.mode) ? a.mode : "video", topic: a.topic || (fr ? "Rendez-vous" : "Meeting"), notes: (a.notes || "") + " [via assistant IA]", date: a.date, time: a.time, status: "pending" });
        await save("notifications", { title: fr ? "Rendez-vous demandé" : "Meeting requested", body: `${a.date} · ${a.time}`, ticketKey: "mtg-" + a.email });
        const ks = new Set(JSON.parse(localStorage.getItem("cdd_keys") || "[]")); ks.add("mtg-" + a.email); localStorage.setItem("cdd_keys", JSON.stringify([...ks]));
        subscribePush("mtg-" + a.email).catch(() => {});
        const when = new Date(a.date + "T00:00").toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" });
        markDone(mi, ai, fr ? `✓ Rendez-vous demandé le ${when} à ${a.time}. Notre équipe vous enverra une confirmation.` : `✓ Meeting requested on ${when} at ${a.time}. Our team will confirm shortly.`);
        return;
      }
      if (a.type === "ticket") {
        const key = genKey();
        await save("tickets", { key, name: a.name || "Visiteur", email: a.email || "", subject: a.subject || "Support", status: "open" });
        await save("messages", { ticketKey: key, from: "user", text: a.message || a.subject || "—" });
        const ks = new Set(JSON.parse(localStorage.getItem("cdd_keys") || "[]")); ks.add(key); localStorage.setItem("cdd_keys", JSON.stringify([...ks]));
        subscribePush(key).catch(() => {});
        markDone(mi, ai, `KEY:${key}`);
      }
    } catch { markDone(mi, ai, fr ? "Échec de l'enregistrement, réessayez." : "Saving failed, please retry."); }
  };

  const suggestions = fr ? [
    [Briefcase, "Quels services proposez-vous ?"], [FileText, "Je veux préparer une demande de devis"], [FolderOpen, "Montre-moi vos projets e-commerce"], [CalendarCheck, "Je veux prendre rendez-vous"], [LifeBuoy, "J'ai besoin d'aide, ouvre un ticket"], [Users, "Qui fait partie de l'équipe ?"],
  ] : [
    [Briefcase, "What services do you offer?"], [FileText, "Help me prepare a quote request"], [FolderOpen, "Show me your e-commerce projects"], [CalendarCheck, "I'd like to book a meeting"], [LifeBuoy, "I need help, open a ticket"], [Users, "Who is on the team?"],
  ];
  const actionLabel = (a: Action) => a.type === "meeting" ? (fr ? `Réserver le ${a.date} à ${a.time}` : `Book ${a.date} at ${a.time}`) : a.type === "quote" ? (fr ? "Envoyer cette demande de devis" : "Send this quote request") : a.type === "ticket" ? (fr ? "Créer ce ticket de support" : "Create this support ticket") : (fr ? "Ouvrir la page " : "Open page ") + a.page;

  return (
    <>
      <button onClick={() => openAssistant()} aria-label={fr ? "Ouvrir l'assistant" : "Open assistant"} className={`fixed z-40 right-4 bottom-5 lg:bottom-6 h-12 pl-3.5 pr-4 rounded-full bg-[#0b1b4d] text-white flex items-center gap-2 shadow-xl shadow-blue-900/30 hover:bg-blue-700 transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100"}`}>
        <span className="relative"><AssistantIcon className="w-6 h-6" /><span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0b1b4d] animate-pulse" /></span>
        <span className="hidden sm:inline text-sm font-semibold">{fr ? "Assistant" : "Assistant"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] bg-white flex flex-col animate-[pageIn_.2s_ease]" role="dialog" aria-modal aria-label="Assistant IA">
          <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white grid place-items-center"><AssistantIcon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-[#0b1b4d] leading-tight">{fr ? "Assistant CODE DEVS" : "CODE DEVS Assistant"}</div><div className="text-xs text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{fr ? "En ligne • répond instantanément" : "Online • instant replies"}</div></div>
              {msgs.length > 0 && <button onClick={() => setMsgs([])} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label={fr ? "Nouvelle conversation" : "New chat"} title={fr ? "Nouvelle conversation" : "New chat"}><RotateCcw className="w-5 h-5" /></button>}
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label={fr ? "Fermer" : "Close"}><X className="w-6 h-6" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/60 to-white">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {!msgs.length && (
                <div className="text-center pt-6 md:pt-14 animate-[fadeUp_.25s_ease_both]">
                  <LogoMark className="w-24 h-14 mx-auto" />
                  <h2 className="mt-5 text-xl md:text-2xl font-extrabold text-[#0b1b4d]">{fr ? "Bonjour 👋 Comment puis-je vous aider ?" : "Hi 👋 How can I help you?"}</h2>
                  <p className="mt-2 text-slate-500 max-w-md mx-auto">{fr ? "Je connais nos services, projets et notre équipe. Je peux aussi préparer votre devis, planifier un rendez-vous ou ouvrir un ticket de support pour vous." : "I know our services, projects and team. I can also prepare your quote, schedule a meeting or open a support ticket for you."}</p>
                  <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
                    {suggestions.map(([I, q]: any, i) => <button key={i} onClick={() => send(q)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-[#0b1b4d] hover:border-blue-400 hover:shadow-md transition" style={{ animation: `fadeUp .5s ${i * 30}ms both` }}><I className="w-5 h-5 text-blue-600 shrink-0" />{q}</button>)}
                  </div>
                </div>
              )}
              {msgs.map((m, mi) => (
                <div key={mi} className={`flex gap-3 animate-[fadeUp_.2s_ease_both] ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center shrink-0 mt-1"><AssistantIcon className="w-4 h-4" /></div>}
                  <div className={`max-w-[85%] ${m.role === "user" ? "" : "flex-1"}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-1 ${m.role === "user" ? "bg-blue-600 text-white rounded-tr-md" : "bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-md"}`}>{m.role === "user" ? m.content : <Md text={m.content} />}</div>
                    {m.actions?.map((a, ai) => {
                      const done = m.done?.[ai];
                      const isKey = done?.startsWith("KEY:");
                      return (
                        <div key={ai} className="mt-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                          {(a.type === "quote" || a.type === "ticket" || a.type === "meeting") && !done && <div className="text-xs text-slate-600 mb-2 space-y-0.5">{Object.entries(a).filter(([k, v]) => k !== "type" && v).map(([k, v]) => <div key={k}><b className="capitalize">{k}</b> : {String(v)}</div>)}</div>}
                          {done ? (isKey ? <div className="text-sm text-emerald-700"><div className="flex items-center gap-1 font-semibold"><Check className="w-4 h-4" />{fr ? "Ticket créé ! Votre clé de chat :" : "Ticket created! Your chat key:"}</div><div className="mt-1 flex items-center gap-2"><code className="font-mono bg-white px-2 py-1 rounded">{done.slice(4)}</code><button onClick={() => navigator.clipboard?.writeText(done.slice(4))} aria-label="Copy"><Copy className="w-4 h-4" /></button><a href="#/support" onClick={() => setOpen(false)} className="text-blue-600 underline">{fr ? "Ouvrir le chat" : "Open chat"}</a></div></div> : <div className="text-sm text-slate-700">{done}</div>)
                            : <button onClick={() => run(a, mi, ai)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-700">{a.type === "meeting" ? <CalendarCheck className="w-4 h-4" /> : a.type === "quote" ? <FileText className="w-4 h-4" /> : a.type === "ticket" ? <LifeBuoy className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}{actionLabel(a)}</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {busy && <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center"><AssistantIcon className="w-4 h-4" /></div><div className="rounded-2xl bg-white border border-slate-100 px-4 py-3 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div></div>}
              <div ref={end} />
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white pb-[env(safe-area-inset-bottom)]">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-3xl mx-auto p-3 md:p-4 flex items-end gap-2">
              <textarea ref={inputRef} rows={1} value={text} maxLength={1500} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={fr ? "Écrivez votre message…" : "Type your message…"} className="flex-1 resize-none max-h-40 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <button disabled={busy || !text.trim()} className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center disabled:opacity-40 hover:bg-blue-700 transition" aria-label={fr ? "Envoyer" : "Send"}><Send className="w-5 h-5" /></button>
            </form>
            <p className="text-center text-[11px] text-slate-400 pb-2">{fr ? "L'assistant peut faire des erreurs. Les actions sont toujours soumises à votre confirmation." : "The assistant can make mistakes. Actions always require your confirmation."}</p>
          </div>
        </div>
      )}
    </>
  );
}
