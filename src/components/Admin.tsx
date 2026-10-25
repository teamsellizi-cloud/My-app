import { useEffect, useState } from "react";
import * as I from "lucide-react";
import { useTable, useSettings, save, remove, uploadFile, supabase, usingSupabase, Table } from "../lib/db";
import { defaultSettings, type L, type Settings } from "../lib/defaults";
import { Logo, card, input, btn } from "./ui";
import { sendPush } from "../lib/push";

const lbl = "text-xs font-semibold text-slate-600";
const Field = ({ label, children }: any) => <label className="block"><span className={lbl}>{label}</span><div className="mt-1">{children}</div></label>;
const LInput = ({ label, v, on, area }: { label: string; v: L; on: (x: L) => void; area?: boolean }) => (
  <div className="grid sm:grid-cols-2 gap-2">
    {(["fr", "en"] as const).map((k) => <Field key={k} label={`${label} (${k.toUpperCase()})`}>{area ? <textarea rows={3} className={input} value={v?.[k] || ""} onChange={(e) => on({ ...v, [k]: e.target.value })} /> : <input className={input} value={v?.[k] || ""} onChange={(e) => on({ ...v, [k]: e.target.value })} />}</Field>)}
  </div>
);
function ImageInput({ label, v, on }: { label: string; v?: string; on: (x: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2 items-center">
        {v && <img src={v} alt="" className="w-12 h-12 rounded-lg object-cover border" />}
        <input className={input} value={v || ""} placeholder="URL" onChange={(e) => on(e.target.value)} />
        <label className="shrink-0 cursor-pointer rounded-xl bg-blue-50 text-blue-700 px-3 py-3 text-sm font-semibold">{busy ? "…" : <I.Upload className="w-4 h-4" />}
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { on(await uploadFile(f)); } catch (er: any) { alert(er.message); } setBusy(false); }} /></label>
      </div>
    </Field>
  );
}
const fmt = (d?: string) => (d ? new Date(d).toLocaleString("fr") : "");
const emptyL = { fr: "", en: "" };

type FieldDef = { k: string; label: string; type: "text" | "l" | "larea" | "image" | "list" | "bool" | "number" | "select"; options?: string[] };
function Crud({ table, fields, title, blank, preview }: { table: Table; fields: FieldDef[]; title: string; blank: any; preview: (r: any) => React.ReactNode }) {
  const { rows } = useTable<any>(table);
  const [edit, setEdit] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...rows].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await save(table, edit); setEdit(null); } catch (er: any) { alert(er.message); } setBusy(false); };
  return (
    <div>
      <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-extrabold text-[#0b1b4d]">{title} <span className="text-slate-400 text-base">({rows.length})</span></h2><button onClick={() => setEdit(structuredClone(blank))} className={`${btn} !py-2 text-sm`}><I.Plus className="w-4 h-4" />Ajouter</button></div>
      {edit && (
        <form onSubmit={submit} className={`${card} p-5 mb-6 space-y-3`}>
          {fields.map((f) => {
            const v = edit[f.k], on = (x: any) => setEdit({ ...edit, [f.k]: x });
            if (f.type === "l" || f.type === "larea") return <LInput key={f.k} label={f.label} v={v || emptyL} on={on} area={f.type === "larea"} />;
            if (f.type === "image") return <ImageInput key={f.k} label={f.label} v={v} on={on} />;
            if (f.type === "list") return <Field key={f.k} label={`${f.label} (séparés par des virgules)`}><input className={input} value={(v || []).join(", ")} onChange={(e) => on(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Field>;
            if (f.type === "bool") return <label key={f.k} className="flex items-center gap-2 text-sm font-semibold text-[#0b1b4d]"><input type="checkbox" checked={!!v} onChange={(e) => on(e.target.checked)} className="w-4 h-4 accent-blue-600" />{f.label}</label>;
            if (f.type === "select") return <Field key={f.k} label={f.label}><select className={input} value={v || ""} onChange={(e) => on(e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select></Field>;
            return <Field key={f.k} label={f.label}><input type={f.type === "number" ? "number" : "text"} className={input} value={v ?? ""} onChange={(e) => on(f.type === "number" ? Number(e.target.value) : e.target.value)} /></Field>;
          })}
          <div className="flex gap-2"><button disabled={busy} className={`${btn} !py-2`}>{busy ? "…" : "Enregistrer"}</button><button type="button" onClick={() => setEdit(null)} className="px-5 rounded-full border border-slate-200 text-sm">Annuler</button></div>
        </form>
      )}
      <div className="grid gap-3">
        {sorted.map((r) => (
          <div key={r.id} className={`${card} p-4 flex items-center gap-4`}>
            <div className="flex-1 min-w-0">{preview(r)}</div>
            <button onClick={() => setEdit(structuredClone(r))} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" aria-label="Modifier"><I.Pencil className="w-4 h-4" /></button>
            <button onClick={() => confirm("Supprimer ?") && remove(table, r.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" aria-label="Supprimer"><I.Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = ["all", "home", "services", "portfolio", "team", "contact", "support"];

function Quotes() {
  const { rows } = useTable<any>("quotes", 15000);
  return (
    <div><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-5">Demandes de devis ({rows.length})</h2>
      <div className="grid gap-3">{[...rows].reverse().map((q) => (
        <div key={q.id} className={`${card} p-5`}>
          <div className="flex flex-wrap justify-between gap-2"><div><b className="text-[#0b1b4d]">{q.name}</b> {q.company && <span className="text-slate-500">— {q.company}</span>}<div className="text-sm text-slate-500">{q.email} {q.whatsapp && `• ${q.whatsapp}`}</div></div>
            <select value={q.status} onChange={(e) => save("quotes", { ...q, status: e.target.value })} className="rounded-lg border px-2 text-sm h-9">{["new", "contacted", "in progress", "won", "lost"].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="mt-2 text-sm"><span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs">{q.service}</span> {q.budget && <span className="text-xs text-slate-500">Budget : {q.budget}</span>} {q.deadline && <span className="text-xs text-slate-500">• Délai : {q.deadline}</span>}</div>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{q.description}</p>
          <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{fmt(q.created_at)}</span><button onClick={() => confirm("Supprimer ?") && remove("quotes", q.id)} className="text-red-500">Supprimer</button></div>
        </div>))}</div>
    </div>
  );
}

function Tickets() {
  const { rows: tickets } = useTable<any>("tickets", 5000);
  const { rows: msgs } = useTable<any>("messages", 4000);
  const [sel, setSel] = useState<string | null>(null);
  const [text, setText] = useState("");
  const t = tickets.find((x) => x.key === sel);
  const thread = msgs.filter((m) => m.ticketKey === sel);
  const reply = async (e: React.FormEvent) => {
    e.preventDefault(); if (!text.trim() || !t) return;
    await save("messages", { ticketKey: t.key, from: "admin", text: text.trim() });
    const nb = `Nouvelle réponse sur votre ticket « ${t.subject} »`;
    await save("notifications", { title: "Support CODE DEVS", body: nb, ticketKey: t.key });
    sendPush({ title: "Support CODE DEVS", body: nb, ticketKey: t.key });
    setText("");
  };
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="space-y-2"><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-3">Tickets ({tickets.length})</h2>
        {[...tickets].reverse().map((x) => { const last = msgs.filter((m) => m.ticketKey === x.key).slice(-1)[0]; return (
          <button key={x.id} onClick={() => setSel(x.key)} className={`${card} w-full text-left p-4 ${sel === x.key ? "ring-2 ring-blue-500" : ""}`}><div className="flex justify-between"><b className="text-sm text-[#0b1b4d] truncate">{x.subject}</b>{last?.from === "user" && x.status !== "closed" && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />}</div><div className="text-xs text-slate-500">{x.name} • {x.key}</div><div className="text-[10px] uppercase mt-1 text-slate-400">{x.status}</div></button>); })}
      </div>
      <div className={`${card} lg:col-span-2 flex flex-col h-[70vh]`}>
        {t ? <>
          <div className="p-4 border-b flex flex-wrap justify-between gap-2"><div><b className="text-[#0b1b4d]">{t.subject}</b><div className="text-xs text-slate-500">{t.name} {t.email} • {t.key}</div></div>
            <select value={t.status} onChange={(e) => save("tickets", { ...t, status: e.target.value })} className="rounded-lg border px-2 text-sm h-9">{["open", "pending", "closed"].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">{thread.map((m) => <div key={m.id} className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.from === "admin" ? "ml-auto bg-blue-600 text-white" : "bg-white border"}`}>{m.text}<div className="text-[10px] opacity-60 mt-1">{fmt(m.created_at)}</div></div>)}</div>
          <form onSubmit={reply} className="p-3 border-t flex gap-2"><input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Répondre…" /><button className="w-12 rounded-xl bg-blue-600 text-white grid place-items-center"><I.Send className="w-4 h-4" /></button></form>
        </> : <div className="m-auto text-slate-400 text-sm">Sélectionnez un ticket</div>}
      </div>
    </div>
  );
}

function Reviews() {
  const { rows } = useTable<any>("reviews", 15000);
  return (
    <div><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-5">Avis ({rows.length})</h2>
      <div className="grid gap-3">{[...rows].reverse().map((r) => (
        <div key={r.id} className={`${card} p-4 flex gap-4 items-start`}>
          <div className="flex-1"><b className="text-[#0b1b4d]">{r.name}</b> <span className="text-amber-500">{"★".repeat(r.rating)}</span><p className="text-sm text-slate-600 mt-1">{r.comment}</p><div className="text-xs text-slate-400 mt-1">{fmt(r.created_at)}</div></div>
          <button onClick={() => save("reviews", { ...r, approved: !r.approved })} className={`text-xs font-semibold rounded-full px-3 py-1.5 ${r.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.approved ? "Publié" : "Approuver"}</button>
          <button onClick={() => confirm("Supprimer ?") && remove("reviews", r.id)} className="text-red-500 p-1"><I.Trash2 className="w-4 h-4" /></button>
        </div>))}</div>
    </div>
  );
}

function Inbox({ table, title, statuses, render }: { table: Table; title: string; statuses: string[]; render: (r: any) => React.ReactNode }) {
  const { rows } = useTable<any>(table, 15000);
  const [filter, setFilter] = useState("all");
  const list = [...rows].reverse().filter((r) => filter === "all" || r.status === filter);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><h2 className="text-xl font-extrabold text-[#0b1b4d]">{title} ({rows.length})</h2>
        <div className="flex gap-1 flex-wrap">{["all", ...statuses].map((s) => <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === s ? "bg-blue-600 text-white" : "bg-white border text-slate-600"}`}>{s}</button>)}</div></div>
      <div className="grid gap-3">{list.map((r) => (
        <div key={r.id} className={`${card} p-5`}>
          <div className="flex flex-wrap justify-between gap-2"><div className="min-w-0 flex-1">{render(r)}</div>
            <select value={r.status} onChange={async (e) => {
              await save(table, { ...r, status: e.target.value });
              if (table === "meetings" && ["confirmed", "cancelled"].includes(e.target.value)) {
                const title = e.target.value === "confirmed" ? "Rendez-vous confirmé ✅" : "Rendez-vous annulé";
                const body = `${r.date} à ${r.time} — CODE DEVS DIGITAL`;
                await save("notifications", { title, body, ticketKey: "mtg-" + r.email });
                sendPush({ title, body, ticketKey: "mtg-" + r.email, url: "/#/booking" });
              }
            }} className="rounded-lg border px-2 text-sm h-9">{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{fmt(r.created_at)}</span><button onClick={() => confirm("Supprimer ?") && remove(table, r.id)} className="text-red-500">Supprimer</button></div>
        </div>))}
        {!list.length && <p className="text-sm text-slate-400">Aucune entrée.</p>}
      </div>
    </div>
  );
}

function Leads() {
  const { rows } = useTable<any>("leads", 15000);
  return (
    <div><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-1">Prospects collectés par l'IA ({rows.length})</h2><p className="text-sm text-slate-500 mb-5">Coordonnées détectées automatiquement dans les conversations avec l'assistant.</p>
      <div className="grid gap-3">{[...rows].reverse().map((l) => <div key={l.id} className={`${card} p-4 flex gap-3`}><div className="flex-1 text-sm"><b className="text-[#0b1b4d]">{l.email || "—"}</b> {l.whatsapp && <span>• {l.whatsapp}</span>}<p className="text-slate-500 mt-1 line-clamp-3">{l.need}</p><div className="text-xs text-slate-400">{fmt(l.created_at)}</div></div><button onClick={() => remove("leads", l.id)} className="text-red-500"><I.Trash2 className="w-4 h-4" /></button></div>)}</div>
    </div>
  );
}

function Notifications() {
  const { rows } = useTable<any>("notifications");
  const [f, setF] = useState({ title: "", body: "" });
  const [res, setRes] = useState("");
  return (
    <div><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-5">Notifications push</h2>
      <form onSubmit={async (e) => { e.preventDefault(); if (!f.title) return; await save("notifications", f); const r = await sendPush(f); setRes(r.ok ? `Push envoyé à ${r.sent}/${r.total} appareils.` : "Enregistrée (push serveur non configuré : affichage dans la cloche et notifications locales)."); setF({ title: "", body: "" }); }} className={`${card} p-5 space-y-3 mb-6`}>
        <input className={input} placeholder="Titre" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className={input} placeholder="Message" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <button className={`${btn} !py-2`}><I.Send className="w-4 h-4" />Envoyer à tous les visiteurs</button>
        {res && <p className="text-sm text-emerald-700">{res}</p>}<p className="text-xs text-slate-400">Les visiteurs ayant activé les notifications reçoivent une notification système ; tous la voient dans la cloche.</p>
      </form>
      <div className="grid gap-2">{rows.filter((n) => !n.ticketKey).reverse().map((n) => <div key={n.id} className={`${card} p-4 flex`}><div className="flex-1"><b className="text-sm">{n.title}</b><p className="text-sm text-slate-500">{n.body}</p><div className="text-xs text-slate-400">{fmt(n.created_at)}</div></div><button onClick={() => remove("notifications", n.id)} className="text-red-500"><I.Trash2 className="w-4 h-4" /></button></div>)}</div>
    </div>
  );
}

function SettingsPanel() {
  const cur = useSettings();
  const [s, setS] = useState<Settings>(cur);
  const [ok, setOk] = useState(false);
  useEffect(() => setS(cur), [JSON.stringify(cur)]);
  const up = (p: Partial<Settings>) => setS({ ...s, ...p });
  useEffect(() => { if (usingSupabase) supabase!.from("secrets").select("data").eq("id", "groq").maybeSingle().then(({ data }) => data && setS((x) => ({ ...x, groqKey: (data as any).data?.key || "" }))); }, []);
  const submit = async (e: React.FormEvent) => { e.preventDefault();
    if (usingSupabase) { await save("secrets", { id: "groq", key: s.groqKey }); await save("settings", { ...s, groqKey: "", id: "site" }); }
    else await save("settings", { ...s, id: "site" }); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <form onSubmit={submit} className="space-y-6">
      <h2 className="text-xl font-extrabold text-[#0b1b4d]">Paramètres du site</h2>
      <div className={`${card} p-5 space-y-3`}><h3 className="font-bold">Identité</h3>
        <Field label="Nom"><input className={input} value={s.agencyName} onChange={(e) => up({ agencyName: e.target.value })} /></Field>
        <LInput label="Slogan" v={s.slogan} on={(slogan) => up({ slogan })} /><LInput label="Texte d'accueil" area v={s.heroText} on={(heroText) => up({ heroText })} /></div>
      <div className={`${card} p-5 space-y-3`}><h3 className="font-bold">Coordonnées</h3>
        <div className="grid sm:grid-cols-2 gap-3"><Field label="WhatsApp (format international)"><input className={input} value={s.whatsapp} onChange={(e) => up({ whatsapp: e.target.value })} placeholder="+237…" /></Field><Field label="E-mail professionnel"><input className={input} value={s.email} onChange={(e) => up({ email: e.target.value })} /></Field><Field label="Localisation"><input className={input} value={s.location} onChange={(e) => up({ location: e.target.value })} /></Field></div>
        <LInput label="Horaires" v={s.hours} on={(hours) => up({ hours })} />
        <div className="grid sm:grid-cols-2 gap-3">{(["facebook", "instagram", "linkedin", "tiktok", "github"] as const).map((k) => <Field key={k} label={k}><input className={input} value={s.socials?.[k] || ""} onChange={(e) => up({ socials: { ...s.socials, [k]: e.target.value } })} placeholder="https://" /></Field>)}</div></div>
      <div className={`${card} p-5 space-y-3`}><h3 className="font-bold">Statistiques</h3>
        {s.stats.map((st, i) => <div key={i} className="grid grid-cols-[90px_1fr_1fr_auto] gap-2"><input className={input} value={st.value} onChange={(e) => { const a = [...s.stats]; a[i] = { ...st, value: e.target.value }; up({ stats: a }); }} />{(["fr", "en"] as const).map((k) => <input key={k} className={input} value={st.label[k]} onChange={(e) => { const a = [...s.stats]; a[i] = { ...st, label: { ...st.label, [k]: e.target.value } }; up({ stats: a }); }} />)}<button type="button" onClick={() => up({ stats: s.stats.filter((_, j) => j !== i) })} className="text-red-500"><I.X className="w-4 h-4" /></button></div>)}
        <button type="button" onClick={() => up({ stats: [...s.stats, { value: "0", label: { fr: "", en: "" } }] })} className="text-sm text-blue-600 font-semibold">+ Ajouter une statistique</button></div>
      <div className={`${card} p-5 space-y-3`}><h3 className="font-bold flex items-center gap-2"><I.Sparkles className="w-4 h-4 text-blue-600" />Assistant IA (Groq)</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-blue-600" checked={s.aiEnabled} onChange={(e) => up({ aiEnabled: e.target.checked })} />Activer l'assistant IA</label>
        <Field label="Clé API Groq (si GROQ_API_KEY n'est pas définie côté Vercel)"><input type="password" className={input} value={s.groqKey} onChange={(e) => up({ groqKey: e.target.value })} placeholder="gsk_…" /></Field>
        <Field label="Modèle"><select className={input} value={s.groqModel} onChange={(e) => up({ groqModel: e.target.value })}>{["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "meta-llama/llama-4-scout-17b-16e-instruct", "qwen/qwen3-32b"].map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Instructions système"><textarea rows={5} className={input} value={s.aiPrompt} onChange={(e) => up({ aiPrompt: e.target.value })} /></Field>
        <button type="button" onClick={() => up({ aiPrompt: defaultSettings.aiPrompt })} className="text-xs text-slate-500 underline">Réinitialiser les instructions</button></div>
      <button className={btn}>{ok ? "✓ Enregistré" : "Enregistrer les paramètres"}</button>
    </form>
  );
}

function Overview({ go }: { go: (t: string) => void }) {
  const c = (t: Table) => useTable<any>(t).rows;
  const pa = c("partnerships"), mt = c("meetings");
  const q = c("quotes"), tk = c("tickets"), rv = c("reviews"), ld = c("leads");
  const tiles = [["quotes", "Devis", q.length, I.FileText], ["tickets", "Tickets ouverts", tk.filter((x) => x.status !== "closed").length, I.LifeBuoy], ["reviews", "Avis en attente", rv.filter((x) => !x.approved).length, I.Star], ["meetings", "RDV en attente", mt.filter((x) => x.status === "pending").length, I.CalendarCheck], ["partnerships", "Partenariats", pa.filter((x) => x.status === "new").length, I.Handshake], ["leads", "Prospects IA", ld.length, I.UserPlus]] as const;
  return (
    <div><h2 className="text-xl font-extrabold text-[#0b1b4d] mb-5">Tableau de bord</h2>
      {!usingSupabase && <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">Mode démo : les données sont stockées dans ce navigateur. Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour la production (voir README).</div>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{tiles.map(([k, l, n, Ic]) => <button key={k} onClick={() => go(k)} className={`${card} p-5 text-left hover:ring-2 ring-blue-200`}><Ic className="w-5 h-5 text-blue-600" /><div className="text-3xl font-extrabold text-[#0b1b4d] mt-2">{n}</div><div className="text-xs text-slate-500">{l}</div></button>)}</div>
    </div>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (supabase) { const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) return setErr(error.message); return onOk(); }
    if (pw === (import.meta.env.VITE_ADMIN_PASSWORD || "admin")) { sessionStorage.setItem("cdd_admin", "1"); onOk(); } else setErr("Mot de passe incorrect");
  };
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-white p-5">
      <form onSubmit={submit} className={`${card} p-8 w-full max-w-sm space-y-4`}>
        <Logo /><h1 className="text-xl font-extrabold text-[#0b1b4d]">Espace administrateur</h1>
        {supabase && <input type="email" required className={input} placeholder="E-mail admin" value={email} onChange={(e) => setEmail(e.target.value)} />}
        <input type="password" required className={input} placeholder="Mot de passe" value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className={`${btn} w-full`}>Connexion</button>
        <a href="#/" className="block text-center text-sm text-slate-500">← Retour au site</a>
      </form>
    </div>
  );
}

const TABS = [["overview", "Aperçu", I.LayoutDashboard], ["projects", "Projets", I.FolderOpen], ["services", "Services", I.LayoutGrid], ["team", "Équipe", I.Users], ["quotes", "Devis", I.FileText], ["partnerships", "Partenariats", I.Handshake], ["meetings", "Rendez-vous", I.CalendarCheck], ["tickets", "Tickets & chat", I.LifeBuoy], ["reviews", "Avis", I.Star], ["leads", "Prospects IA", I.UserPlus], ["partners", "Partenaires", I.Building2], ["popups", "Pop-ups", I.PanelTop], ["news", "Actualités", I.Newspaper], ["notifications", "Notifications", I.Bell], ["settings", "Paramètres & IA", I.Settings]] as const;

export default function Admin() {
  const [authed, setAuthed] = useState(!supabase && sessionStorage.getItem("cdd_admin") === "1");
  const [tab, setTab] = useState("overview");
  const [menu, setMenu] = useState(false);
  useEffect(() => { supabase?.auth.getSession().then(({ data }) => data.session && setAuthed(true)); }, []);
  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  const logout = async () => { await supabase?.auth.signOut(); sessionStorage.removeItem("cdd_admin"); setAuthed(false); };
  const L2 = (r: any) => r?.fr || "";
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`${menu ? "block" : "hidden"} lg:block lg:w-64 bg-white border-r border-slate-100 p-4 lg:min-h-screen lg:sticky lg:top-0`}>
        <div className="hidden lg:block mb-6"><Logo small /></div>
        {TABS.map(([k, l, Ic]) => <button key={k} onClick={() => { setTab(k); setMenu(false); }} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${tab === k ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`}><Ic className="w-4 h-4" />{l}</button>)}
        <div className="mt-6 border-t pt-4 space-y-1"><a href="#/" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600"><I.ExternalLink className="w-4 h-4" />Voir le site</a><button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-red-500"><I.LogOut className="w-4 h-4" />Déconnexion</button></div>
      </aside>
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b p-3 flex justify-between items-center"><Logo small /><button onClick={() => setMenu(!menu)} className="p-2 text-blue-600"><I.Menu /></button></div>
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        {tab === "overview" && <Overview go={setTab} />}
        {tab === "projects" && <Crud table="projects" title="Projets" blank={{ name: "", url: "https://", category: "", description: emptyL, tech: [], features: [], featured: false, order: 99 }}
          fields={[{ k: "name", label: "Nom", type: "text" }, { k: "url", label: "URL", type: "text" }, { k: "category", label: "Catégorie", type: "text" }, { k: "logo", label: "Logo", type: "image" }, { k: "screenshot", label: "Capture d'écran", type: "image" }, { k: "description", label: "Description", type: "larea" }, { k: "tech", label: "Technologies confirmées", type: "list" }, { k: "features", label: "Fonctionnalités confirmées", type: "list" }, { k: "order", label: "Ordre", type: "number" }, { k: "featured", label: "Mettre en avant sur l'accueil", type: "bool" }]}
          preview={(r) => <div className="flex items-center gap-3">{r.screenshot && <img src={r.screenshot} alt="" className="w-16 h-11 rounded-lg object-cover object-top" />}<div className="min-w-0"><b className="text-[#0b1b4d]">{r.name}</b> {r.featured && <I.Star className="inline w-3.5 h-3.5 fill-amber-400 text-amber-400" />}<div className="text-xs text-slate-500 truncate">{r.category} • {r.url}</div></div></div>} />}
        {tab === "services" && <Crud table="services" title="Services" blank={{ icon: "Globe", title: emptyL, description: emptyL, order: 99 }}
          fields={[{ k: "icon", label: "Icône (Globe, Bot, ShoppingCart, CreditCard, Sparkles, ShieldCheck, Lightbulb, Smartphone, Server, Database, Cloud, Palette, Megaphone, Lock, Zap, Cpu, Monitor)", type: "text" }, { k: "title", label: "Titre", type: "l" }, { k: "description", label: "Description", type: "larea" }, { k: "order", label: "Ordre", type: "number" }]}
          preview={(r) => <><b className="text-[#0b1b4d]">{L2(r.title)}</b><div className="text-xs text-slate-500 truncate">{L2(r.description)}</div></>} />}
        {tab === "team" && <Crud table="team" title="Équipe" blank={{ name: "", role: emptyL, bio: emptyL, order: 99 }}
          fields={[{ k: "name", label: "Nom", type: "text" }, { k: "avatar", label: "Photo de profil", type: "image" }, { k: "role", label: "Rôle", type: "l" }, { k: "bio", label: "À propos", type: "larea" }, { k: "order", label: "Ordre", type: "number" }]}
          preview={(r) => <div className="flex items-center gap-3">{r.avatar ? <img src={r.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center font-bold">{r.name?.[0]}</div>}<div><b className="text-[#0b1b4d]">{r.name}</b><div className="text-xs text-slate-500">{L2(r.role)}</div></div></div>} />}
        {tab === "partners" && <Crud table="partners" title="Partenaires (site public)" blank={{ name: "", website: "https://", category: "", description: emptyL, featured: true, order: 99 }}
          fields={[{ k: "name", label: "Nom", type: "text" }, { k: "category", label: "Catégorie (ex. Technologie, Paiement, Média)", type: "text" }, { k: "website", label: "Site web", type: "text" }, { k: "logo", label: "Logo", type: "image" }, { k: "image", label: "Image de couverture", type: "image" }, { k: "description", label: "Présentation", type: "larea" }, { k: "order", label: "Ordre", type: "number" }, { k: "featured", label: "Afficher dans le bandeau de l'accueil", type: "bool" }]}
          preview={(r) => <div className="flex items-center gap-3">{r.logo ? <img src={r.logo} alt="" className="w-10 h-10 rounded-lg object-contain border p-0.5" /> : <div className="w-10 h-10 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">{r.name?.[0]}</div>}<div><b className="text-[#0b1b4d]">{r.name}</b><div className="text-xs text-slate-500">{r.category} {r.website && `• ${r.website}`}</div></div></div>} />}
        {tab === "popups" && <Crud table="popups" title="Pop-ups" blank={{ title: emptyL, body: emptyL, screen: "all", active: true }}
          fields={[{ k: "title", label: "Titre", type: "l" }, { k: "body", label: "Contenu", type: "larea" }, { k: "image", label: "Image", type: "image" }, { k: "ctaLabel", label: "Texte du bouton", type: "text" }, { k: "ctaUrl", label: "Lien du bouton", type: "text" }, { k: "screen", label: "Écran", type: "select", options: SCREENS }, { k: "active", label: "Actif", type: "bool" }]}
          preview={(r) => <><b className="text-[#0b1b4d]">{L2(r.title)}</b><div className="text-xs text-slate-500">Écran : {r.screen} • {r.active ? "Actif" : "Inactif"}</div></>} />}
        {tab === "news" && <Crud table="news" title="Actualités & mises à jour" blank={{ title: emptyL, body: emptyL, screen: "home" }}
          fields={[{ k: "title", label: "Titre", type: "l" }, { k: "body", label: "Contenu", type: "larea" }, { k: "image", label: "Image", type: "image" }, { k: "screen", label: "Écran d'affichage", type: "select", options: SCREENS }]}
          preview={(r) => <><b className="text-[#0b1b4d]">{L2(r.title)}</b><div className="text-xs text-slate-500">Écran : {r.screen} • {fmt(r.created_at)}</div></>} />}
        {tab === "quotes" && <Quotes />}
        {tab === "tickets" && <Tickets />}
        {tab === "reviews" && <Reviews />}
        {tab === "leads" && <Leads />}
        {tab === "partnerships" && <Inbox table="partnerships" title="Demandes de partenariat" statuses={["new", "in review", "accepted", "declined"]} render={(r) => <>
          <b className="text-[#0b1b4d]">{r.name}</b> <span className="text-slate-500">— {r.organization}{r.role && ` (${r.role})`}</span>
          <div className="text-sm text-slate-500">{r.email}{r.whatsapp && ` • ${r.whatsapp}`}{r.website && <> • <a href={r.website} target="_blank" rel="noreferrer" className="text-blue-600">{r.website}</a></>}</div>
          <span className="inline-block mt-2 rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs">{r.type}</span>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{r.proposal}</p></>} />}
        {tab === "meetings" && <Inbox table="meetings" title="Rendez-vous" statuses={["pending", "confirmed", "done", "cancelled"]} render={(r) => <>
          <div className="flex items-center gap-2"><span className="rounded-lg bg-blue-600 text-white px-2 py-1 text-xs font-bold">{r.date} · {r.time}</span><span className="text-xs text-slate-500">{r.mode}</span></div>
          <div className="mt-2"><b className="text-[#0b1b4d]">{r.name}</b> {r.company && <span className="text-slate-500">— {r.company}</span>}</div>
          <div className="text-sm text-slate-500">{r.email}{r.whatsapp && ` • ${r.whatsapp}`}</div>
          <div className="text-sm mt-1"><span className="text-xs rounded-full bg-slate-100 px-2 py-0.5">{r.topic}</span></div>
          {r.notes && <p className="mt-2 text-sm text-slate-600">{r.notes}</p>}</>} />}
        {tab === "notifications" && <Notifications />}
        {tab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}
