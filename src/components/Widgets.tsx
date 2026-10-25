import { useEffect, useRef, useState } from "react";
import { Send, Copy, KeyRound, LifeBuoy, ArrowLeft } from "lucide-react";
import { useTable, save, findTicket, ticketMessages } from "../lib/db";
import { genKey, tr, useLang } from "../lib/app";
import { subscribePush } from "../lib/push";
import type { Popup, Ticket, Message } from "../lib/defaults";
import { Modal, btn, card, input, Section } from "./ui";

/** Shows active popups targeted at the current screen (route or section), once per visitor. */
export function Popups({ screen }: { screen: string }) {
  const { lang } = useLang();
  const { rows } = useTable<Popup>("popups");
  const [section, setSection] = useState("home");
  const [closed, setClosed] = useState<string[]>(() => JSON.parse(localStorage.getItem("cdd_popups") || "[]"));
  useEffect(() => {
    if (screen !== "home") return;
    const ids = ["services", "portfolio", "equipe", "contact"];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setSection(e.target.id === "equipe" ? "team" : e.target.id)), { threshold: 0.3 });
    ids.forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, [screen]);
  const current = screen === "home" ? section : screen;
  const p = rows.find((x) => x.active && !closed.includes(x.id) && (x.screen === "all" || x.screen === current));
  if (!p) return null;
  const close = () => { const c = [...closed, p.id]; setClosed(c); localStorage.setItem("cdd_popups", JSON.stringify(c)); };
  return (
    <Modal open onClose={close}>
      {p.image && <img src={p.image} alt="" className="w-full max-h-64 object-cover rounded-t-3xl" />}
      <div className="p-6"><h3 className="text-xl font-extrabold text-[#0b1b4d]">{tr(p.title, lang)}</h3><p className="mt-2 text-slate-600 whitespace-pre-line">{tr(p.body, lang)}</p>
        {p.ctaUrl && <a href={p.ctaUrl} onClick={close} className={`${btn} mt-5`}>{p.ctaLabel || "OK"}</a>}</div>
    </Modal>
  );
}

function ChatRoom({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const { lang } = useLang();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [tk, setTk] = useState(ticket);
  useEffect(() => {
    const load = () => { ticketMessages(ticket.key).then(setMsgs); findTicket(ticket.key).then((x) => x && setTk(x)); };
    load(); const iv = setInterval(load, 4000); addEventListener("cdd-db", load);
    return () => { clearInterval(iv); removeEventListener("cdd-db", load); };
  }, [ticket.key]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs.length]);
  const send = async (e: React.FormEvent) => { e.preventDefault(); const q = text.trim(); if (!q) return; setText(""); await save("messages", { ticketKey: ticket.key, from: "user", text: q } as any); };
  return (
    <div className={`${card} overflow-hidden flex flex-col h-[70vh]`}>
      <div className="p-4 border-b border-slate-100 flex items-center gap-3"><button onClick={onBack} aria-label="Retour"><ArrowLeft className="w-5 h-5 text-slate-500" /></button><div className="flex-1 min-w-0"><div className="font-bold text-[#0b1b4d] truncate">{ticket.subject}</div><div className="text-xs text-slate-400">{tk.key} • {tk.status}</div></div></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        <div className="text-center text-xs text-slate-400">{lang === "fr" ? "Un membre de l'équipe vous répondra ici. Gardez votre clé de chat." : "A team member will reply here. Keep your chat key."}</div>
        {msgs.map((m) => <div key={m.id} className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.from === "user" ? "ml-auto bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-700"}`}>{m.text}<div className={`text-[10px] mt-1 ${m.from === "user" ? "text-blue-100" : "text-slate-400"}`}>{m.from === "admin" ? "Support • " : ""}{m.created_at && new Date(m.created_at).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}</div></div>)}
        <div ref={end} />
      </div>
      {tk.status !== "closed" ? <form onSubmit={send} className="p-3 border-t border-slate-100 flex gap-2"><input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" maxLength={2000} /><button className="w-12 rounded-xl bg-blue-600 text-white grid place-items-center" aria-label="Envoyer"><Send className="w-4 h-4" /></button></form>
        : <div className="p-4 text-center text-sm text-slate-500">{lang === "fr" ? "Ce ticket est fermé." : "This ticket is closed."}</div>}
    </div>
  );
}

export function SupportPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [created, setCreated] = useState<string>("");
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "", hp: "" });
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const remember = (k: string) => { const ks = new Set(JSON.parse(localStorage.getItem("cdd_keys") || "[]")); ks.add(k); localStorage.setItem("cdd_keys", JSON.stringify([...ks])); };
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (f.hp) return;
    if (f.name.trim().length < 2 || f.subject.trim().length < 3 || f.message.trim().length < 10) { setErr(fr ? "Remplissez correctement tous les champs obligatoires." : "Please fill all required fields."); return; }
    setBusy(true);
    try {
      const k = genKey();
      const tk = await save<any>("tickets", { key: k, name: f.name.trim(), email: f.email.trim(), subject: f.subject.trim(), status: "open" });
      await save("messages", { ticketKey: k, from: "user", text: f.message.trim() } as any);
      remember(k); setCreated(k); setTicket(tk); subscribePush(k).catch(() => {});
    } catch { setErr(fr ? "Impossible de créer le ticket." : "Could not create ticket."); } finally { setBusy(false); }
  };
  const open = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const tk = (await findTicket(key.trim().toUpperCase())) as Ticket | null;
    if (!tk) return setErr(fr ? "Clé de chat introuvable." : "Chat key not found.");
    remember(tk.key); setTicket(tk); subscribePush(tk.key).catch(() => {});
  };
  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center"><LifeBuoy /></div><div><h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1b4d]">{fr ? "Support client" : "Customer support"}</h1><p className="text-slate-500 text-sm">{fr ? "Créez un ticket et discutez avec notre équipe grâce à votre clé unique." : "Create a ticket and chat with our team using your unique key."}</p></div></div>
        {created && ticket && <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800 flex flex-wrap items-center gap-2">{fr ? "Ticket créé ! Votre clé de chat :" : "Ticket created! Your chat key:"} <b className="font-mono">{created}</b><button onClick={() => navigator.clipboard?.writeText(created)} className="inline-flex items-center gap-1 text-emerald-700 underline"><Copy className="w-3.5 h-3.5" />{fr ? "Copier" : "Copy"}</button></div>}
        {ticket ? <ChatRoom ticket={ticket} onBack={() => { setTicket(null); setCreated(""); }} /> : (
          <div className="grid md:grid-cols-5 gap-5">
            <form onSubmit={create} className={`${card} p-6 md:col-span-3 space-y-3`}>
              <h2 className="font-bold text-[#0b1b4d]">{fr ? "Nouveau ticket" : "New ticket"}</h2>
              <input className="hidden" tabIndex={-1} value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} />
              <input className={input} placeholder={fr ? "Nom *" : "Name *"} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input type="email" className={input} placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <input className={input} placeholder={fr ? "Sujet *" : "Subject *"} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
              <textarea rows={4} className={input} placeholder={fr ? "Votre message *" : "Your message *"} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              <button disabled={busy} className={`${btn} w-full`}>{busy ? "…" : fr ? "Créer le ticket" : "Create ticket"}</button>
            </form>
            <form onSubmit={open} className={`${card} p-6 md:col-span-2 space-y-3 h-fit`}>
              <h2 className="font-bold text-[#0b1b4d] flex items-center gap-2"><KeyRound className="w-5 h-5 text-blue-600" />{fr ? "J'ai une clé de chat" : "I have a chat key"}</h2>
              <input className={`${input} font-mono uppercase`} placeholder="CDD-XXXX-XXXX-XXXX" value={key} onChange={(e) => setKey(e.target.value)} />
              <button className={`${btn} w-full`}>{fr ? "Accéder au chat" : "Open chat"}</button>
              {JSON.parse(localStorage.getItem("cdd_keys") || "[]").map((k: string) => <button type="button" key={k} onClick={() => setKey(k)} className="block text-xs font-mono text-blue-600">{k}</button>)}
            </form>
            {err && <p className="md:col-span-5 text-sm text-red-600">{err}</p>}
          </div>
        )}
      </div>
    </Section>
  );
}

