import { useEffect, useMemo, useState } from "react";
import { Handshake, CalendarCheck, Check, Video, Phone, MapPin, Clock, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { save, bookedSlots } from "../lib/db";
import { useLang } from "../lib/app";
import { subscribePush } from "../lib/push";
import { Section, Reveal, btn, card, input } from "./ui";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const Err = ({ m }: { m?: string }) => (m ? <span className="text-xs text-red-600">{m}</span> : null);
const Label = ({ t, children }: any) => <label className="block"><span className="text-xs font-semibold text-slate-600">{t}</span><div className="mt-1">{children}</div></label>;

function Success({ title, body, onReset }: { title: string; body: string; onReset: () => void }) {
  return (
    <div className="text-center py-10 animate-[popIn_.5s_both]">
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 grid place-items-center"><Check className="w-7 h-7" /></div>
      <h3 className="mt-4 font-bold text-lg text-[#0b1b4d]">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{body}</p>
      <button onClick={onReset} className="mt-5 text-sm font-semibold text-blue-600">OK</button>
    </div>
  );
}

/* ---------------- Partnership ---------------- */
export function PartnershipPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const types = fr ? ["Partenariat technique", "Partenariat commercial / revente", "Sous-traitance", "Agence / freelance", "Sponsoring / événement", "Investissement", "Autre"] : ["Technical partnership", "Commercial / reseller", "Subcontracting", "Agency / freelance", "Sponsoring / event", "Investment", "Other"];
  const empty = { name: "", organization: "", role: "", email: "", whatsapp: "", website: "", type: "", proposal: "", hp: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<Record<string, string>>({});
  const [st, setSt] = useState<"" | "busy" | "ok" | "err">("");
  const [ts] = useState(Date.now());
  const set = (k: keyof typeof empty) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = fr ? "Nom requis" : "Name required";
    if (f.organization.trim().length < 2) er.organization = fr ? "Organisation requise" : "Organization required";
    if (!emailOk(f.email)) er.email = fr ? "E-mail invalide" : "Invalid email";
    if (!f.type) er.type = fr ? "Choisissez un type" : "Choose a type";
    if (f.proposal.trim().length < 30) er.proposal = fr ? "30 caractères minimum" : "30 characters minimum";
    setErr(er);
    if (Object.keys(er).length || f.hp || Date.now() - ts < 3000) return;
    setSt("busy");
    try { const { hp, ...d } = f; await save("partnerships", { ...d, status: "new" }); setSt("ok"); setF(empty); } catch { setSt("err"); }
  };

  const perks = fr
    ? [["Expertise complémentaire", "Web, mobile, paiements, IA et automatisation."], ["Collaboration transparente", "Communication claire et suivi régulier."], ["Croissance mutuelle", "Des projets communs à forte valeur ajoutée."]]
    : [["Complementary expertise", "Web, mobile, payments, AI and automation."], ["Transparent collaboration", "Clear communication and regular follow-up."], ["Mutual growth", "High-value joint projects."]];

  return (
    <Section>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Reveal from="left"><div className={`${card} p-5`}>
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white grid place-items-center"><Handshake className="w-5 h-5" /></div>
            <h2 className="mt-3 text-lg font-extrabold text-[#0b1b4d]">{fr ? "Construisons ensemble" : "Let's build together"}</h2>
            <p className="mt-1 text-sm text-slate-500">{fr ? "Entreprises, agences, freelances, institutions : proposez-nous une collaboration. Chaque demande est étudiée par notre équipe." : "Companies, agencies, freelancers, institutions: propose a collaboration. Every request is reviewed by our team."}</p>
          </div></Reveal>
          {perks.map(([t, b], i) => (
            <Reveal key={t} from="left" delay={(i + 1) * 100}><div className={`${card} p-4 flex gap-3`}><Check className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" /><div><div className="font-semibold text-sm text-[#0b1b4d]">{t}</div><div className="text-xs text-slate-500">{b}</div></div></div></Reveal>
          ))}
        </div>
        <Reveal from="right" className="lg:col-span-3">
          <form onSubmit={submit} noValidate className={`${card} p-5 md:p-6`}>
            {st === "ok" ? <Success title={fr ? "Demande envoyée" : "Request sent"} body={fr ? "Votre proposition de partenariat a bien été enregistrée. Nous vous répondrons rapidement." : "Your partnership proposal has been saved. We'll reply shortly."} onReset={() => setSt("")} /> : <>
              <h3 className="font-bold text-[#0b1b4d] mb-4">{fr ? "Demande de partenariat" : "Partnership request"}</h3>
              <input className="hidden" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Label t={fr ? "Nom complet *" : "Full name *"}><input className={input} value={f.name} onChange={set("name")} /><Err m={err.name} /></Label>
                <Label t={fr ? "Organisation *" : "Organization *"}><input className={input} value={f.organization} onChange={set("organization")} /><Err m={err.organization} /></Label>
                <Label t={fr ? "Fonction" : "Role"}><input className={input} value={f.role} onChange={set("role")} /></Label>
                <Label t="E-mail *"><input type="email" className={input} value={f.email} onChange={set("email")} /><Err m={err.email} /></Label>
                <Label t="WhatsApp"><input className={input} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+237 …" /></Label>
                <Label t={fr ? "Site web" : "Website"}><input className={input} value={f.website} onChange={set("website")} placeholder="https://" /></Label>
              </div>
              <div className="mt-3"><Label t={fr ? "Type de partenariat *" : "Partnership type *"}>
                <div className="flex flex-wrap gap-2">{types.map((x) => <button type="button" key={x} onClick={() => setF({ ...f, type: x })} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${f.type === x ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:border-blue-400"}`}>{x}</button>)}</div><Err m={err.type} />
              </Label></div>
              <div className="mt-3"><Label t={fr ? "Votre proposition *" : "Your proposal *"}><textarea rows={4} className={input} value={f.proposal} onChange={set("proposal")} placeholder={fr ? "Objectifs, apports de chaque partie, calendrier…" : "Goals, what each party brings, timeline…"} /><Err m={err.proposal} /></Label></div>
              {st === "err" && <p className="mt-2 text-sm text-red-600">{fr ? "L'enregistrement a échoué." : "Saving failed."}</p>}
              <button disabled={st === "busy"} className={`${btn} mt-4 w-full sm:w-auto`}>{st === "busy" ? "…" : fr ? "Envoyer la proposition" : "Send proposal"} <Send className="w-4 h-4" /></button>
            </>}
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------- Meeting booking ---------------- */
export const SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function BookingPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [offset, setOffset] = useState(0);
  const days = useMemo(() => {
    const out: Date[] = []; const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
    while (out.length < 21) { if (d.getDay() !== 0) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  }, []);
  const visible = days.slice(offset, offset + 6);
  const [date, setDate] = useState<string>(ymd(days[0]));
  const [time, setTime] = useState("");
  const [taken, setTaken] = useState<string[]>([]);
  const modes = [["video", Video, fr ? "Visio" : "Video call"], ["phone", Phone, fr ? "Appel / WhatsApp" : "Call / WhatsApp"], ["onsite", MapPin, fr ? "En présentiel" : "In person"]] as const;
  const topics = fr ? ["Nouveau projet", "Suivi de projet", "Partenariat", "Conseil numérique", "Autre"] : ["New project", "Project follow-up", "Partnership", "Digital consulting", "Other"];
  const empty = { name: "", email: "", whatsapp: "", company: "", mode: "video", topic: "", notes: "", hp: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<Record<string, string>>({});
  const [st, setSt] = useState<"" | "busy" | "ok" | "err">("");
  const set = (k: keyof typeof empty) => (e: any) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { bookedSlots(date).then(setTaken).catch(() => setTaken([])); setTime(""); }, [date, st]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!time) er.time = fr ? "Choisissez un créneau" : "Choose a time slot";
    if (f.name.trim().length < 2) er.name = fr ? "Nom requis" : "Name required";
    if (!emailOk(f.email)) er.email = fr ? "E-mail invalide" : "Invalid email";
    if (!f.topic) er.topic = fr ? "Choisissez un sujet" : "Choose a topic";
    setErr(er);
    if (Object.keys(er).length || f.hp) return;
    setSt("busy");
    try {
      const latest = await bookedSlots(date);
      if (latest.includes(time)) { setTaken(latest); setErr({ time: fr ? "Ce créneau vient d'être réservé." : "This slot was just booked." }); setSt(""); return; }
      const { hp, ...d } = f;
      await save("meetings", { ...d, date, time, status: "pending" });
      const mk = "mtg-" + d.email; const ks = new Set(JSON.parse(localStorage.getItem("cdd_keys") || "[]")); ks.add(mk); localStorage.setItem("cdd_keys", JSON.stringify([...ks]));
      subscribePush(mk).catch(() => {});
      setSt("ok"); setF(empty);
    } catch { setSt("err"); }
  };
  const dLabel = (d: Date) => d.toLocaleDateString(lang, { weekday: "short" });
  const fullDate = new Date(date + "T00:00").toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" });

  return (
    <Section>
      {st === "ok" ? <div className={`${card} max-w-lg mx-auto`}><Success title={fr ? "Rendez-vous demandé" : "Meeting requested"} body={fr ? `Votre demande pour le ${fullDate} est enregistrée. Vous recevrez une confirmation de notre équipe.` : `Your request for ${fullDate} is saved. Our team will confirm shortly.`} onReset={() => setSt("")} /></div> : (
        <form onSubmit={submit} noValidate className="grid lg:grid-cols-5 gap-6">
          <Reveal from="left" className="lg:col-span-3"><div className={`${card} p-5 md:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0b1b4d] flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-blue-600" />{fr ? "1. Choisissez une date" : "1. Pick a date"}</h3>
              <div className="flex gap-1">
                <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 6))} className="w-8 h-8 rounded-lg border border-slate-200 grid place-items-center disabled:opacity-30" aria-label="Précédent"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" disabled={offset + 6 >= days.length} onClick={() => setOffset(offset + 6)} className="w-8 h-8 rounded-lg border border-slate-200 grid place-items-center disabled:opacity-30" aria-label="Suivant"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {visible.map((d) => { const k = ymd(d), on = k === date; return (
                <button type="button" key={k} onClick={() => setDate(k)} className={`rounded-xl py-2.5 text-center border transition ${on ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25" : "border-slate-200 hover:border-blue-400"}`}>
                  <div className={`text-[11px] uppercase ${on ? "text-blue-100" : "text-slate-400"}`}>{dLabel(d)}</div><div className="text-lg font-bold">{d.getDate()}</div><div className={`text-[11px] ${on ? "text-blue-100" : "text-slate-400"}`}>{d.toLocaleDateString(lang, { month: "short" })}</div>
                </button>); })}
            </div>
            <h3 className="mt-6 mb-3 font-bold text-[#0b1b4d] flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" />{fr ? "2. Choisissez un créneau" : "2. Pick a time"}</h3>
            <div className="grid grid-cols-4 gap-2">
              {SLOTS.map((s) => { const busy = taken.includes(s), on = time === s; return (
                <button type="button" key={s} disabled={busy} onClick={() => setTime(s)} className={`rounded-xl py-2 text-sm font-semibold border transition ${busy ? "border-slate-100 text-slate-300 line-through cursor-not-allowed" : on ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-[#0b1b4d] hover:border-blue-400"}`}>{s}</button>); })}
            </div>
            <Err m={err.time} />
            <p className="mt-3 text-[11px] text-slate-400">{fr ? "Heure du Cameroun (WAT). Durée indicative : 30 min." : "Cameroon time (WAT). Approx. duration: 30 min."}</p>
          </div></Reveal>

          <Reveal from="right" className="lg:col-span-2"><div className={`${card} p-5 md:p-6 space-y-3`}>
            <h3 className="font-bold text-[#0b1b4d]">{fr ? "3. Vos informations" : "3. Your details"}</h3>
            <input className="hidden" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} />
            <div className="grid grid-cols-3 gap-2">{modes.map(([k, I, l]) => <button type="button" key={k} onClick={() => setF({ ...f, mode: k })} className={`rounded-xl p-2 text-[11px] font-semibold border flex flex-col items-center gap-1 transition ${f.mode === k ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}><I className="w-4 h-4" />{l}</button>)}</div>
            <Label t={fr ? "Nom complet *" : "Full name *"}><input className={input} value={f.name} onChange={set("name")} /><Err m={err.name} /></Label>
            <Label t="E-mail *"><input type="email" className={input} value={f.email} onChange={set("email")} /><Err m={err.email} /></Label>
            <div className="grid grid-cols-2 gap-2">
              <Label t="WhatsApp"><input className={input} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+237 …" /></Label>
              <Label t={fr ? "Entreprise" : "Company"}><input className={input} value={f.company} onChange={set("company")} /></Label>
            </div>
            <Label t={fr ? "Sujet *" : "Topic *"}><select className={input} value={f.topic} onChange={set("topic")}><option value="">—</option>{topics.map((x) => <option key={x}>{x}</option>)}</select><Err m={err.topic} /></Label>
            <Label t={fr ? "Notes" : "Notes"}><textarea rows={2} className={input} value={f.notes} onChange={set("notes")} /></Label>
            {time && <div className="rounded-xl bg-blue-50 text-blue-800 text-xs p-3"><b className="capitalize">{fullDate}</b> · {time}</div>}
            {st === "err" && <p className="text-sm text-red-600">{fr ? "L'enregistrement a échoué." : "Saving failed."}</p>}
            <button disabled={st === "busy"} className={`${btn} w-full`}>{st === "busy" ? "…" : fr ? "Réserver le rendez-vous" : "Book meeting"}</button>
          </div></Reveal>
        </form>
      )}
    </Section>
  );
}

/** Next bookable days (Sundays excluded) — shared with the AI assistant. */
export function bookableDays(n = 21): string[] {
  const out: string[] = []; const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
  while (out.length < n) { if (d.getDay() !== 0) out.push(ymd(d)); d.setDate(d.getDate() + 1); }
  return out;
}
