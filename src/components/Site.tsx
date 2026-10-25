import { useEffect, useMemo, useState } from "react";
import { Handshake, CalendarCheck, ArrowRight, Mail, Menu, X, ExternalLink, Star, Home, LayoutGrid, FolderOpen, Users, Send, MessageCircle, Phone, MapPin, Clock, Check, Code2, Cloud, Globe, LifeBuoy, Newspaper } from "lucide-react";
import { useTable, save } from "../lib/db";
import { useLang, t, tr, Lang } from "../lib/app";
import { TECH, type Partner, type Project, type Service, type Member, type Review, type News, type Settings } from "../lib/defaults";
import { Icon, Logo, LogoMark, Section, Heading, Reveal, Modal, btn, btnOutline, card, input } from "./ui";
import NotificationBell from "./NotificationBell";

const ROUTES: Record<string, string> = { accueil: "home", services: "services", portfolio: "portfolio", equipe: "team", contact: "contact", devis: "contact" };
export const go = (id: string) => { location.hash = "#/" + (ROUTES[id] ?? id); };
export const useHashRoute = () => {
  const [r, setR] = useState(location.hash.replace(/^#\/?/, ""));
  useEffect(() => { const h = () => setR(location.hash.replace(/^#\/?/, "")); addEventListener("hashchange", h); return () => removeEventListener("hashchange", h); }, []);
  return r;
};
const NAV = [["home", "accueil", Home], ["services", "services", LayoutGrid], ["portfolio", "portfolio", FolderOpen], ["team", "equipe", Users], ["contact", "contact", Mail]] as const;

export function Header() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const route = useHashRoute();
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <button onClick={() => go("accueil")} aria-label="Accueil"><Logo /></button>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV.map(([k, id]) => <button key={k} onClick={() => go(id)} className={`relative py-1 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 ${route === ROUTES[id] ? "text-blue-600 after:w-full" : "after:w-0 hover:after:w-full"}`}>{t(k, lang)}</button>)}
          <a href="#/partners" className={`hover:text-blue-600 ${route === "partners" || route === "partnership" ? "text-blue-600" : ""}`}>{lang === "fr" ? "Partenaires" : "Partners"}</a>
          <a href="#/support" className={`hover:text-blue-600 ${route === "support" ? "text-blue-600" : ""}`}>{t("support", lang)}</a>
        </nav>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <a href="#/booking" className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${route === "booking" ? "bg-blue-600 border-blue-600 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}><CalendarCheck className="w-4 h-4" />{lang === "fr" ? "Rendez-vous" : "Book a call"}</a>
          <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-[#0b1b4d]" aria-label="Changer de langue">
            <span>{lang === "fr" ? "🇫🇷" : "🇬🇧"}</span>{lang.toUpperCase()}
          </button>
          <button className="lg:hidden p-2 text-blue-600" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden animate-[slideDown_.3s_ease] border-t border-slate-100 bg-white px-5 py-4 space-y-1">
          {NAV.map(([k, id, I]) => <button key={k} onClick={() => { setOpen(false); go(id); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[#0b1b4d] font-medium hover:bg-blue-50"><I className="w-5 h-5 text-blue-600" />{t(k, lang)}</button>)}
          <a href="#/reviews" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#0b1b4d] font-medium hover:bg-blue-50"><Star className="w-5 h-5 text-blue-600" />{t("reviews", lang)}</a>
          <a href="#/support" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#0b1b4d] font-medium hover:bg-blue-50"><LifeBuoy className="w-5 h-5 text-blue-600" />{t("support", lang)}</a>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a href="#/partners" onClick={() => setOpen(false)} className="col-span-2 flex items-center gap-3 rounded-xl px-3 py-3 text-[#0b1b4d] font-medium hover:bg-blue-50"><Users className="w-5 h-5 text-blue-600" />{lang === "fr" ? "Nos partenaires" : "Our partners"}</a>
            <a href="#/partnership" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700"><Handshake className="w-4 h-4" />{lang === "fr" ? "Partenariat" : "Partnership"}</a>
            <a href="#/booking" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white"><CalendarCheck className="w-4 h-4" />{lang === "fr" ? "Rendez-vous" : "Book a call"}</a>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroArt() {
  return (
    <div className="relative h-[280px] md:h-[380px] max-w-md mx-auto w-full" aria-hidden>
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-100 via-cyan-50 to-white blur-2xl" />
      <div className="absolute right-0 bottom-10 w-[78%] h-[52%] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2 shadow-2xl rotate-[-4deg]">
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 p-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-md bg-white/25" />)}
        </div>
      </div>
      <div className="absolute left-[18%] top-0 w-[46%] max-w-[210px] aspect-[9/18.5] rounded-[2.2rem] bg-slate-900 p-2 shadow-2xl shadow-blue-900/30 animate-[float_6s_ease-in-out_infinite]">
        <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-b from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center text-center px-3">
          <LogoMark className="w-24 h-14" />
          <div className="mt-2 font-extrabold text-[#0b1b4d] text-sm">CODE DEVS</div>
          <div className="text-[9px] tracking-[0.3em] text-blue-600 font-semibold">DIGITAL</div>
          <div className="mt-3 text-[10px] text-blue-700">Concevoir. Innover.<br />Connecter.</div>
        </div>
      </div>
      {[[Code2, "left-[4%] top-[18%]", "bg-blue-600 text-white"], [Cloud, "left-[2%] top-[48%]", "bg-white text-blue-600"], [Globe, "right-[6%] top-[10%]", "bg-white text-blue-600"]].map(([I, pos, c]: any, i) => (
        <div key={i} className={`absolute ${pos} ${c} w-14 h-14 rounded-2xl shadow-xl grid place-items-center animate-[float_5s_ease-in-out_infinite]`} style={{ animationDelay: `${i * 0.8}s` }}><I className="w-7 h-7" /></div>
      ))}
    </div>
  );
}

export function Hero({ s }: { s: Settings }) {
  const { lang } = useLang();
  const words = tr(s.slogan, lang).split(" ");
  return (
    <section id="accueil" className="relative overflow-hidden scroll-mt-20">
      <div className="max-w-6xl mx-auto px-5 pt-6 pb-10 md:py-14 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
        <Reveal>
          <span className="inline-block rounded-full bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5">{t("tag", lang)}</span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight text-[#0b1b4d]">
            {words.map((w, i) => <span key={i} className={`block ${i === words.length - 1 ? "text-blue-600" : ""}`}>{w}</span>)}
          </h1>
          <p className="mt-4 text-slate-600 text-base max-w-md">{tr(s.heroText, lang)}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button onClick={() => go("portfolio")} className={btn}>{t("discover", lang)} <ArrowRight className="w-5 h-5" /></button>
            <button onClick={() => go("contact")} className={btnOutline}>{t("contactUs", lang)} <Mail className="w-5 h-5" /></button>
          </div>
        </Reveal>
        <HeroArt />
      </div>
    </section>
  );
}

function ProjectCard({ p, onDetails }: { p: Project; onDetails: () => void }) {
  const { lang } = useLang();
  return (
    <article className={`${card} overflow-hidden flex flex-col h-full group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-600/10 transition duration-300`}>
      <div className="aspect-[16/10] bg-gradient-to-br from-blue-600 to-cyan-400 relative overflow-hidden">
        {p.screenshot && <img src={p.screenshot} alt={`Capture d'écran ${p.name}`} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300" onError={(e) => (e.currentTarget.style.display = "none")} />}
        {p.logo && <img src={p.logo} alt="" className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white p-1 shadow object-contain" />}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-[#0b1b4d]">{p.name}</h3>
        <span className="mt-1 text-xs font-semibold text-blue-600">{p.category}</span>
        <p className="mt-2 text-sm text-slate-500 flex-1">{tr(p.description, lang)}</p>
        {p.tech?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{p.tech.map((x) => <span key={x} className="text-[11px] rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{x}</span>)}</div>}
        <div className="mt-4 flex gap-2">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${btn} !px-4 !py-2 text-sm flex-1`}>{t("visit", lang)} <ExternalLink className="w-4 h-4" /></a>
          <button onClick={onDetails} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0b1b4d] hover:border-blue-500 hover:text-blue-600">{t("details", lang)}</button>
        </div>
      </div>
    </article>
  );
}

function ProjectDetails({ p, onClose }: { p: Project | null; onClose: () => void }) {
  const { lang } = useLang();
  if (!p) return null;
  return (
    <Modal open onClose={onClose} wide>
      {p.screenshot && <img src={p.screenshot} alt={p.name} className="w-full aspect-[16/9] object-cover object-top rounded-t-3xl" />}
      <div className="p-6">
        <span className="text-xs font-semibold text-blue-600">{p.category}</span>
        <h3 className="text-2xl font-extrabold text-[#0b1b4d]">{p.name}</h3>
        <p className="mt-3 text-slate-600">{tr(p.description, lang)}</p>
        {p.tech?.length > 0 && <><h4 className="mt-5 font-bold text-[#0b1b4d]">{t("tech2", lang)}</h4><div className="mt-2 flex flex-wrap gap-2">{p.tech.map((x) => <span key={x} className="text-xs rounded-full bg-blue-50 text-blue-700 px-3 py-1">{x}</span>)}</div></>}
        {p.features?.length > 0 && <><h4 className="mt-5 font-bold text-[#0b1b4d]">{t("features", lang)}</h4><ul className="mt-2 space-y-1.5">{p.features.map((f) => <li key={f} className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-cyan-500 mt-0.5" />{f}</li>)}</ul></>}
        <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${btn} mt-6`}>{t("visit", lang)} <ExternalLink className="w-4 h-4" /></a>
      </div>
    </Modal>
  );
}

const sortO = <T extends { order?: number }>(a: T[]) => [...a].sort((x, y) => (x.order ?? 99) - (y.order ?? 99));

export function Featured() {
  const { lang } = useLang();
  const { rows } = useTable<Project>("projects");
  const [sel, setSel] = useState<Project | null>(null);
  const list = sortO(rows).filter((p) => p.featured);
  if (!list.length) return null;
  return (
    <Section className="bg-gradient-to-b from-slate-50/80 to-white">
      <Heading title={t("featured", lang)} sub={t("featuredSub", lang)} action={<button onClick={() => go("portfolio")} className="text-blue-600 font-semibold text-sm flex items-center gap-1 shrink-0">{t("seeAll", lang)} <ArrowRight className="w-4 h-4" /></button>} />
      <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto snap-x pb-4 -mx-5 px-5 md:mx-0 md:px-0">
        {list.map((p) => <div key={p.id} className="snap-start min-w-[80%] sm:min-w-[45%] md:min-w-0"><ProjectCard p={p} onDetails={() => setSel(p)} /></div>)}
      </div>
      <ProjectDetails p={sel} onClose={() => setSel(null)} />
    </Section>
  );
}

export function Services({ limit }: { limit?: number }) {
  const { lang } = useLang();
  const { rows } = useTable<Service>("services");
  return (
    <Section id="services">
      <Heading title={t("ourServices", lang)} sub={t("servicesSub", lang)} action={limit ? <button onClick={() => go("services")} className="text-blue-600 font-semibold text-sm flex items-center gap-1 shrink-0">{t("seeAll", lang)} <ArrowRight className="w-4 h-4" /></button> : undefined} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortO(rows).slice(0, limit || 99).map((s) => (
          <Reveal key={s.id}><div className={`${card} p-5 h-full flex flex-col group hover:-translate-y-1.5 hover:shadow-xl transition duration-300`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center transition duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6"><Icon name={s.icon} className="w-6 h-6" /></div>
            <h3 className="mt-4 font-bold text-[#0b1b4d]">{tr(s.title, lang)}</h3>
            <p className="mt-1.5 text-sm text-slate-500 flex-1">{tr(s.description, lang)}</p>
            <button onClick={() => go("devis")} className="mt-4 self-start text-sm font-semibold text-blue-600 flex items-center gap-1">{t("quote", lang)} <ArrowRight className="w-4 h-4" /></button>
          </div></Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Stats({ s }: { s: Settings }) {
  const { lang } = useLang();
  const icons = ["Send", "Code2", "Users", "LayoutGrid"];
  return (
    <div className="max-w-6xl mx-auto px-5">
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50/60 border border-blue-100 divide-x divide-blue-100/80">
        {s.stats.map((x, i) => (
          <div key={i} className="p-5 text-center"><Icon name={icons[i % 4]} className="w-6 h-6 mx-auto text-blue-600" />
            <div className="mt-2 text-2xl font-extrabold text-blue-700">{x.value}</div><div className="text-xs text-slate-500">{tr(x.label, lang)}</div></div>
        ))}
      </div>
    </div>
  );
}

export function Portfolio() {
  const { lang } = useLang();
  const { rows } = useTable<Project>("projects");
  const [cat, setCat] = useState("all");
  const [sel, setSel] = useState<Project | null>(null);
  const cats = useMemo(() => [...new Set(rows.map((p) => p.category))], [rows]);
  const list = sortO(rows).filter((p) => cat === "all" || p.category === cat);
  return (
    <Section id="portfolio">
      <Heading title={t("portfolio", lang)} sub={`${rows.length} ${lang === "fr" ? "projets réalisés" : "delivered projects"}`} />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" role="tablist">
        {["all", ...cats].map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "bg-slate-100 text-slate-600 hover:bg-blue-50"}`}>{c === "all" ? t("all", lang) : c}</button>)}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{list.map((p) => <Reveal key={p.id}><ProjectCard p={p} onDetails={() => setSel(p)} /></Reveal>)}</div>
      <ProjectDetails p={sel} onClose={() => setSel(null)} />
    </Section>
  );
}

export function About() {
  const { lang } = useLang();
  return (
    <Section className="bg-slate-50/70">
      <div className={`${card} p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center`}>
        <div>
          <span className="inline-block rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">{t("about", lang)}</span>
          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-[#0b1b4d]">{t("why", lang)}</h2>
          <p className="mt-3 text-slate-600">{t("aboutText", lang)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t("values", lang).split("|").map((v, i) => <div key={v} className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-4"><Icon name={["Award", "Eye", "Sparkles", "HeartHandshake"][i]} className="w-6 h-6 text-blue-600" /><div className="mt-2 font-semibold text-[#0b1b4d]">{v}</div></div>)}
        </div>
      </div>
    </Section>
  );
}

export function Team({ limit }: { limit?: number }) {
  const { lang } = useLang();
  const { rows } = useTable<Member>("team");
  return (
    <Section id="equipe">
      <Heading title={t("team", lang)} sub={lang === "fr" ? "Les personnes derrière vos projets." : "The people behind your projects."} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {sortO(rows).slice(0, limit || 99).map((m) => (
          <Reveal key={m.id}><div className={`${card} p-5 text-center h-full group hover:-translate-y-1.5 transition duration-300`}>
            {m.avatar ? <img src={m.avatar} alt={m.name} loading="lazy" className="w-20 h-20 mx-auto rounded-full object-cover ring-4 ring-blue-50 group-hover:scale-105 transition" />
              : <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white grid place-items-center text-2xl font-extrabold ring-4 ring-blue-50">{m.name[0]}</div>}
            <h3 className="mt-4 font-bold text-lg text-[#0b1b4d]">{m.name}</h3>
            <div className="text-sm font-semibold text-blue-600">{tr(m.role, lang)}</div>
            <p className="mt-2 text-sm text-slate-500">{tr(m.bio, lang)}</p>
          </div></Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Process() {
  const { lang } = useLang();
  const icons = ["MessagesSquare", "Search", "FileText", "PenTool", "Code2", "FlaskConical", "Rocket", "Wrench"];
  return (
    <Section className="bg-gradient-to-b from-white to-blue-50/40">
      <Heading title={t("process", lang)} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {t("steps", lang).split("|").map((s, i) => (
          <div key={s} className={`${card} p-5`}><div className="flex items-center justify-between"><Icon name={icons[i]} className="w-6 h-6 text-blue-600" /><span className="text-3xl font-extrabold text-blue-100">{String(i + 1).padStart(2, "0")}</span></div><div className="mt-3 font-bold text-[#0b1b4d]">{s}</div></div>
        ))}
      </div>
      <h3 className="mt-14 mb-5 text-xl font-extrabold text-[#0b1b4d]">{t("tech", lang)}</h3>
      <div className="flex flex-wrap gap-3">{TECH.map((x) => <span key={x} className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-2.5 text-sm font-semibold text-[#0b1b4d]">{x}</span>)}</div>
    </Section>
  );
}

export function NewsBlock({ screen }: { screen: string }) {
  const { lang } = useLang();
  const { rows } = useTable<News>("news");
  const list = rows.filter((n) => n.screen === screen || n.screen === "all").reverse().slice(0, 3);
  if (!list.length) return null;
  return (
    <div className="max-w-6xl mx-auto px-5 py-6">
      <div className="flex items-center gap-2 mb-3 text-[#0b1b4d] font-bold"><Newspaper className="w-5 h-5 text-blue-600" />{t("news", lang)}</div>
      <div className="grid md:grid-cols-3 gap-4">
        {list.map((n) => <article key={n.id} className={`${card} overflow-hidden`}>{n.image && <img src={n.image} alt="" className="w-full h-36 object-cover" loading="lazy" />}<div className="p-4"><div className="text-[11px] text-slate-400">{n.created_at && new Date(n.created_at).toLocaleDateString(lang)}</div><h4 className="font-bold text-[#0b1b4d]">{tr(n.title, lang)}</h4><p className="text-sm text-slate-500 mt-1">{tr(n.body, lang)}</p></div></article>)}
      </div>
    </div>
  );
}

export function Reviews({ limit }: { limit?: number }) {
  const { lang } = useLang();
  const { rows } = useTable<Review>("reviews");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", rating: 5, comment: "", hp: "" });
  const [st, setSt] = useState<"" | "busy" | "ok" | "err">("");
  const approved = rows.filter((r) => r.approved).reverse().slice(0, limit || 999);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.hp || f.name.trim().length < 2 || f.comment.trim().length < 5) return;
    setSt("busy");
    try { await save("reviews", { name: f.name.trim(), rating: f.rating, comment: f.comment.trim(), approved: false } as any); setSt("ok"); setF({ name: "", rating: 5, comment: "", hp: "" }); } catch { setSt("err"); }
  };
  return (
    <Section>
      <Heading title={t("reviews", lang)} action={<button onClick={() => { setOpen(true); setSt(""); }} className={`${btnOutline} !py-2 text-sm shrink-0`}>{t("leaveReview", lang)}</button>} />
      {approved.length ? <div className="grid md:grid-cols-3 gap-5">{approved.map((r) => (
        <div key={r.id} className={`${card} p-6`}><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-4 h-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</div><p className="mt-3 text-slate-600 text-sm">“{r.comment}”</p><div className="mt-4 font-semibold text-[#0b1b4d]">{r.name}</div></div>
      ))}</div> : <p className="text-slate-500">{t("noReviews", lang)}</p>}
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="p-6 space-y-3">
          <h3 className="text-xl font-extrabold text-[#0b1b4d]">{t("leaveReview", lang)}</h3>
          {st === "ok" ? <p className="rounded-xl bg-emerald-50 text-emerald-700 p-4 text-sm">{lang === "fr" ? "Merci ! Votre avis sera publié après validation." : "Thank you! Your review will be published after moderation."}</p> : <>
            <input className="hidden" tabIndex={-1} autoComplete="off" value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} />
            <input required minLength={2} className={input} placeholder={lang === "fr" ? "Votre nom" : "Your name"} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} onClick={() => setF({ ...f, rating: i })} aria-label={`${i} étoiles`}><Star className={`w-8 h-8 ${i <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} /></button>)}</div>
            <textarea required minLength={5} rows={4} className={input} placeholder={lang === "fr" ? "Votre avis sur CODE DEVS DIGITAL" : "Your review"} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
            {st === "err" && <p className="text-sm text-red-600">Erreur, réessayez.</p>}
            <button disabled={st === "busy"} className={`${btn} w-full`}>{st === "busy" ? "…" : lang === "fr" ? "Publier" : "Submit"}</button>
          </>}
        </form>
      </Modal>
    </Section>
  );
}

export function QuoteContact({ s }: { s: Settings }) {
  const { lang } = useLang();
  const { rows: services } = useTable<Service>("services");
  const empty = { name: "", company: "", email: "", whatsapp: "", service: "", budget: "", deadline: "", description: "", hp: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<Record<string, string>>({});
  const [st, setSt] = useState<"" | "busy" | "ok" | "err">("");
  const [ts] = useState(Date.now());
  const fr = lang === "fr";
  const set = (k: keyof typeof empty) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = fr ? "Nom requis" : "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.email = fr ? "E-mail invalide" : "Invalid email";
    if (f.whatsapp && !/^\+?[\d\s-]{8,}$/.test(f.whatsapp)) er.whatsapp = fr ? "Numéro invalide" : "Invalid number";
    if (!f.service) er.service = fr ? "Choisissez un service" : "Choose a service";
    if (f.description.trim().length < 20) er.description = fr ? "20 caractères minimum" : "20 characters minimum";
    setErr(er);
    if (Object.keys(er).length) return;
    if (f.hp || Date.now() - ts < 3000) return; // honeypot + time trap
    const last = Number(localStorage.getItem("cdd_last_quote") || 0);
    if (Date.now() - last < 60000) { setErr({ description: fr ? "Veuillez patienter une minute avant un nouvel envoi." : "Please wait a minute before sending again." }); return; }
    setSt("busy");
    try {
      const { hp, ...data } = f;
      await save("quotes", { ...data, status: "new" } as any);
      localStorage.setItem("cdd_last_quote", String(Date.now()));
      setSt("ok"); setF(empty);
    } catch { setSt("err"); }
  };
  const F = ({ k, label, children }: any) => <label className="block"><span className="text-xs font-semibold text-slate-600">{label}</span><div className="mt-1">{children}</div>{err[k] && <span className="text-xs text-red-600">{err[k]}</span>}</label>;
  const wa = s.whatsapp.replace(/\D/g, "");
  const contacts = [
    [Phone, "WhatsApp", s.whatsapp, wa && `https://wa.me/${wa}`], [Mail, "E-mail", s.email, s.email && `mailto:${s.email}`],
    [MapPin, fr ? "Localisation" : "Location", s.location], [Clock, fr ? "Horaires" : "Hours", tr(s.hours, lang)],
  ] as const;
  return (
    <Section id="contact" className="bg-gradient-to-b from-blue-50/50 to-white">
      <div id="devis" className="scroll-mt-20" />
      <Heading title={t("quote", lang)} sub={fr ? "Décrivez votre projet, nous revenons vers vous rapidement." : "Describe your project and we'll get back to you quickly."} />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} noValidate className={`${card} p-5 md:p-7 lg:col-span-2`}>
          {st === "ok" ? (
            <div className="text-center py-10"><div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 grid place-items-center"><Check className="w-8 h-8" /></div><p className="mt-4 font-semibold text-[#0b1b4d]">{t("sent", lang)}</p><button type="button" onClick={() => setSt("")} className={`${btnOutline} mt-6`}>OK</button></div>
          ) : <>
            <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden value={f.hp} onChange={set("hp")} />
            <div className="grid sm:grid-cols-2 gap-4">
              {F({ k: "name", label: fr ? "Nom complet *" : "Full name *", children: <input className={input} value={f.name} onChange={set("name")} autoComplete="name" /> })}
              {F({ k: "company", label: fr ? "Entreprise" : "Company", children: <input className={input} value={f.company} onChange={set("company")} /> })}
              {F({ k: "email", label: "E-mail *", children: <input type="email" className={input} value={f.email} onChange={set("email")} autoComplete="email" /> })}
              {F({ k: "whatsapp", label: "WhatsApp", children: <input className={input} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+237 …" /> })}
              {F({ k: "service", label: fr ? "Type de service *" : "Service type *", children: <select className={input} value={f.service} onChange={set("service")}><option value="">—</option>{sortO(services).map((x) => <option key={x.id}>{tr(x.title, lang)}</option>)}</select> })}
              {F({ k: "budget", label: fr ? "Budget estimé" : "Estimated budget", children: <select className={input} value={f.budget} onChange={set("budget")}><option value="">—</option>{["< 100 000 FCFA", "100 000 – 300 000 FCFA", "300 000 – 1 000 000 FCFA", "> 1 000 000 FCFA", fr ? "À définir" : "To be defined"].map((b) => <option key={b}>{b}</option>)}</select> })}
              {F({ k: "deadline", label: fr ? "Délai" : "Deadline", children: <select className={input} value={f.deadline} onChange={set("deadline")}><option value="">—</option>{(fr ? ["Urgent (< 2 semaines)", "1 mois", "2 – 3 mois", "Flexible"] : ["Urgent (< 2 weeks)", "1 month", "2 – 3 months", "Flexible"]).map((b) => <option key={b}>{b}</option>)}</select> })}
            </div>
            <div className="mt-4">{F({ k: "description", label: fr ? "Description du projet *" : "Project description *", children: <textarea rows={5} className={input} value={f.description} onChange={set("description")} /> })}</div>
            {st === "err" && <p className="mt-3 text-sm text-red-600">{fr ? "L'enregistrement a échoué. Réessayez." : "Saving failed. Please retry."}</p>}
            <button disabled={st === "busy"} className={`${btn} mt-6 w-full sm:w-auto`}>{st === "busy" ? "…" : t("send", lang)} <Send className="w-4 h-4" /></button>
          </>}
        </form>
        <div className="space-y-3">
          {contacts.map(([I, label, val, href]) => (
            <div key={label} className={`${card} p-4 flex items-center gap-3`}><div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0"><I className="w-5 h-5" /></div><div className="min-w-0"><div className="text-xs text-slate-400">{label}</div>{val ? (href ? <a href={href} className="font-semibold text-[#0b1b4d] break-all hover:text-blue-600">{val}</a> : <div className="font-semibold text-[#0b1b4d]">{val}</div>) : <div className="text-sm text-slate-400 italic">{t("notConfigured", lang)}</div>}</div></div>
          ))}
          <a href="#/support" className={`${card} p-4 flex items-center gap-3 hover:border-blue-300`}><div className="w-11 h-11 rounded-xl bg-blue-600 text-white grid place-items-center"><LifeBuoy className="w-5 h-5" /></div><div><div className="font-semibold text-[#0b1b4d]">{fr ? "Support & tickets" : "Support & tickets"}</div><div className="text-xs text-slate-500">{fr ? "Ouvrir un ticket ou reprendre un chat" : "Open a ticket or resume a chat"}</div></div></a>
        </div>
      </div>
    </Section>
  );
}

export function Footer({ s }: { s: Settings }) {
  const { lang } = useLang();
  const { rows: services } = useTable<Service>("services");
  const { rows: projects } = useTable<Project>("projects");
  const socials = Object.entries(s.socials || {}).filter(([, v]) => v);
  return (
    <footer className="bg-[#0b1b4d] text-slate-300 pb-0">
      <div className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
        <div className="lg:col-span-1"><Logo small light /><p className="mt-4 text-cyan-300 font-semibold">{tr(s.slogan, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-2">{socials.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-3 py-1 capitalize hover:bg-blue-600">{k}</a>)}</div></div>
        <div><h4 className="font-bold text-white mb-3">{lang === "fr" ? "Liens rapides" : "Quick links"}</h4>{NAV.map(([k, id]) => <button key={k} onClick={() => go(id)} className="block py-1 hover:text-white">{t(k, lang)}</button>)}<a href="#/reviews" className="block py-1 hover:text-white">{t("reviews", lang)}</a><a href="#/partners" className="block py-1 hover:text-white">{lang === "fr" ? "Nos partenaires" : "Our partners"}</a><a href="#/partnership" className="block py-1 hover:text-white">{lang === "fr" ? "Partenariat" : "Partnership"}</a><a href="#/booking" className="block py-1 hover:text-white">{lang === "fr" ? "Prendre rendez-vous" : "Book a meeting"}</a><a href="#/support" className="block py-1 hover:text-white">{t("support", lang)}</a></div>
        <div><h4 className="font-bold text-white mb-3">{t("services", lang)}</h4>{sortO(services).slice(0, 7).map((x) => <div key={x.id} className="py-1">{tr(x.title, lang)}</div>)}</div>
        <div><h4 className="font-bold text-white mb-3">{t("portfolio", lang)}</h4>{sortO(projects).map((p) => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-white">{p.name}</a>)}</div>
        <div><h4 className="font-bold text-white mb-3">{t("contact", lang)}</h4>
          {s.whatsapp && <div className="py-1">WhatsApp : {s.whatsapp}</div>}{s.email && <div className="py-1 break-all">{s.email}</div>}<div className="py-1">{s.location}</div><div className="py-1">{tr(s.hours, lang)}</div>
          <h4 className="font-bold text-white mt-5 mb-2">{t("legal", lang)}</h4>
          <a href="#/privacy" className="block py-1 hover:text-white">{t("privacy", lang)}</a><a href="#/legal" className="block py-1 hover:text-white">{t("mentions", lang)}</a><a href="#/terms" className="block py-1 hover:text-white">{t("terms", lang)}</a><a href="#/cookies" className="block py-1 hover:text-white">Cookies</a><a href="#/accessibility" className="block py-1 hover:text-white">{lang === "fr" ? "Accessibilité" : "Accessibility"}</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© 2026 CODE DEVS DIGITAL. {t("rights", lang)}</div>
    </footer>
  );
}

export function WhatsAppFab({ s }: { s: Settings }) {
  const wa = s.whatsapp.replace(/\D/g, "");
  if (!wa) return null;
  return <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="fixed z-40 right-4 bottom-[5.25rem] lg:bottom-[5.5rem] w-12 h-12 rounded-full bg-emerald-500 text-white grid place-items-center shadow-xl shadow-emerald-500/40 hover:scale-105 transition"><MessageCircle className="w-6 h-6" /></a>;
}

export type { Lang };

export function Partners({ compact }: { compact?: boolean }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { rows } = useTable<Partner>("partners");
  const [sel, setSel] = useState<Partner | null>(null);
  const list = sortO(rows).filter((p) => !compact || p.featured !== false);
  if (!list.length) return compact ? null : <Section><p className="text-center text-slate-500">{fr ? "Nos partenaires seront bientôt présentés ici." : "Our partners will be featured here soon."}</p></Section>;
  if (compact) return (
    <section className="py-10 border-y border-slate-100 bg-white overflow-hidden" aria-label={fr ? "Partenaires" : "Partners"}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between mb-5"><h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{fr ? "Ils nous font confiance" : "Trusted by"}</h2><a href="#/partners" className="text-blue-600 font-semibold text-sm flex items-center gap-1">{t("seeAll", lang)} <ArrowRight className="w-4 h-4" /></a></div>
      <div className={`flex gap-4 w-max ${list.length > 3 ? "animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]" : "mx-auto"}`}>
        {(list.length > 3 ? [...list, ...list] : list).map((p, i) => (
          <a key={i} href="#/partners" className="h-16 min-w-40 px-5 rounded-2xl border border-slate-100 bg-white grid place-items-center grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition" title={p.name}>
            {p.logo ? <img src={p.logo} alt={p.name} loading="lazy" className="max-h-10 max-w-32 object-contain" /> : <span className="font-bold text-[#0b1b4d]">{p.name}</span>}
          </a>
        ))}
      </div>
    </section>
  );
  return (
    <Section>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={i * 30}><article className={`${card} overflow-hidden h-full flex flex-col group hover:-translate-y-1.5 hover:shadow-xl transition duration-300`}>
            <div className="relative h-36 bg-gradient-to-br from-blue-50 to-cyan-50">
              {p.image && <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />}
              <div className="absolute -bottom-7 left-5 w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-100 grid place-items-center overflow-hidden">
                {p.logo ? <img src={p.logo} alt={p.name} className="max-w-[80%] max-h-[80%] object-contain" /> : <span className="font-black text-blue-600 text-xl">{p.name[0]}</span>}
              </div>
            </div>
            <div className="p-5 pt-9 flex-1 flex flex-col">
              <h3 className="font-bold text-[#0b1b4d]">{p.name}</h3>
              {p.category && <span className="text-xs font-semibold text-blue-600">{p.category}</span>}
              <p className="mt-2 text-sm text-slate-500 flex-1 line-clamp-3">{tr(p.description, lang)}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setSel(p)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold hover:border-blue-500 hover:text-blue-600">{t("details", lang)}</button>
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-600 text-white px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-1">{fr ? "Site web" : "Website"} <ExternalLink className="w-3 h-3" /></a>}
              </div>
            </div>
          </article></Reveal>
        ))}
      </div>
      <div className={`${card} mt-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-br from-blue-50 to-white`}>
        <div><h3 className="text-lg font-extrabold text-[#0b1b4d]">{fr ? "Devenir partenaire" : "Become a partner"}</h3><p className="text-sm text-slate-500">{fr ? "Rejoignez notre réseau et construisons ensemble." : "Join our network and let's build together."}</p></div>
        <a href="#/partnership" className={btn}>{fr ? "Proposer un partenariat" : "Propose a partnership"} <ArrowRight className="w-4 h-4" /></a>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)}>
        {sel && <>{sel.image && <img src={sel.image} alt="" className="w-full h-48 object-cover rounded-t-2xl" />}<div className="p-6">
          <div className="flex items-center gap-3">{sel.logo && <img src={sel.logo} alt="" className="w-12 h-12 rounded-xl object-contain border p-1" />}<div><h3 className="text-xl font-extrabold text-[#0b1b4d]">{sel.name}</h3>{sel.category && <span className="text-xs font-semibold text-blue-600">{sel.category}</span>}</div></div>
          <p className="mt-4 text-slate-600 whitespace-pre-line text-sm">{tr(sel.description, lang)}</p>
          {sel.website && <a href={sel.website} target="_blank" rel="noopener noreferrer" className={`${btn} mt-5`}>{fr ? "Visiter le site" : "Visit website"} <ExternalLink className="w-4 h-4" /></a>}
        </div></>}
      </Modal>
    </Section>
  );
}
