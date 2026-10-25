import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Code2, Cloud, Globe, Bot, ShoppingCart, CreditCard, Sparkles, ShieldCheck, Lightbulb } from "lucide-react";
import { useLang, tr } from "../lib/app";
import { useSettings, useTable } from "../lib/db";
import type { Service } from "../lib/defaults";
import { LogoMark, Reveal, Icon, card } from "./ui";
import { HowItWorks, PlatformFeatures, Commitments, FAQ } from "./Welcome";
import { openAssistant } from "./Assistant";

/** Animated wipe used when leaving the welcome screen. */
export function explore() {
  const el = document.createElement("div");
  el.className = "fixed inset-0 z-[120] pointer-events-none";
  el.innerHTML = `<div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-[#0b1b4d] origin-bottom animate-[wipeIn_.28s_cubic-bezier(.7,0,.3,1)_forwards]"></div>`;
  document.body.appendChild(el);
  setTimeout(() => { location.hash = "#/home"; el.firstElementChild!.className = "absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-[#0b1b4d] origin-top animate-[wipeOut_.3s_cubic-bezier(.7,0,.3,1)_forwards]"; }, 290);
  setTimeout(() => el.remove(), 650);
}

function useMouse() {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => { const h = (e: MouseEvent) => setP({ x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 }); addEventListener("mousemove", h); return () => removeEventListener("mousemove", h); }, []);
  return p;
}
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => { const h = () => setY(scrollY); addEventListener("scroll", h, { passive: true }); return () => removeEventListener("scroll", h); }, []);
  return y;
}

function Typer({ words }: { words: string[] }) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i % words.length];
    const id = setTimeout(() => {
      if (!del && n < w.length) setN(n + 1);
      else if (!del) setDel(true);
      else if (n > 0) setN(n - 1);
      else { setDel(false); setI(i + 1); }
    }, !del && n === w.length ? 1600 : del ? 35 : 70);
    return () => clearTimeout(id);
  }, [n, del, i, words]);
  return <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{words[i % words.length].slice(0, n)}<span className="inline-block w-[3px] h-[0.9em] bg-blue-600 ml-1 align-middle animate-pulse" /></span>;
}

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const num = parseInt(value) || 0, suffix = value.replace(/^\d+/, "");
  const [v, setV] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(num * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    ref.current && io.observe(ref.current);
    return () => io.disconnect();
  }, [num]);
  return <span ref={ref}>{v}{suffix}</span>;
}

const ORBIT = [Code2, Globe, Bot, ShoppingCart, CreditCard, Cloud, Sparkles, ShieldCheck];

export default function Intro() {
  const { lang, setLang } = useLang();
  const fr = lang === "fr";
  const s = useSettings();
  const { rows: services } = useTable<Service>("services");
  const m = useMouse();
  const y = useScrollY();

  return (
    <div className="bg-white text-[#0b1b4d] overflow-x-hidden">
      {/* Top bar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${y > 40 ? "bg-white/80 backdrop-blur-xl shadow-sm" : ""}`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between animate-[slideDown_.4s_.1s_both]">
          <div className="flex items-center gap-2"><LogoMark className="w-12 h-7" /><span className="font-black tracking-tight"><span className="text-[#111827]">CODE</span> <span className="text-blue-600">DEVS</span></span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(fr ? "en" : "fr")} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold">{fr ? "🇫🇷 FR" : "🇬🇧 EN"}</button>
            <button onClick={explore} className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#0b1b4d] text-white text-sm font-semibold px-4 py-2 hover:bg-blue-600 transition">{fr ? "Explorer" : "Explore"} <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] opacity-60" />
        <div className="absolute w-[520px] h-[520px] rounded-full bg-blue-400/30 blur-[100px] animate-[blob_14s_ease-in-out_infinite]" style={{ transform: `translate(${m.x * -60 - 200}px, ${m.y * -60 - 120}px)` }} />
        <div className="absolute w-[420px] h-[420px] rounded-full bg-cyan-300/40 blur-[100px] animate-[blob_18s_ease-in-out_infinite_reverse]" style={{ transform: `translate(${m.x * 50 + 220}px, ${m.y * 50 + 140}px)` }} />

        {/* orbiting icons */}
        <div className="absolute w-[min(94vw,600px)] aspect-square animate-[spin_60s_linear_infinite] opacity-90" style={{ transform: `translateY(${y * 0.15}px)` }}>
          {ORBIT.map((I, i) => {
            const a = (i / ORBIT.length) * Math.PI * 2;
            return <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)", left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%` }}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-xl shadow-blue-900/10 border border-slate-100 grid place-items-center text-blue-600 animate-[spin_60s_linear_infinite_reverse]" style={{ animationDelay: `${i * -0.3}s` }}>
                <div className="animate-[popIn_.6s_both]" style={{ animationDelay: `${0.3 + i * 0.04}s` }}><I className="w-5 h-5" /></div>
              </div>
            </div>;
          })}
        </div>

        <div className="relative z-10 text-center px-5 max-w-3xl" style={{ transform: `translateY(${y * -0.25}px)`, opacity: Math.max(0, 1 - y / 600) }}>
          <div className="relative inline-block" style={{ transform: `perspective(800px) rotateY(${m.x * 18}deg) rotateX(${m.y * -18}deg)` }}>
            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full animate-pulse" />
            <LogoMark className="relative w-32 h-20 md:w-44 md:h-28 animate-[logoIn_.6s_cubic-bezier(.2,.9,.3,1.2)_both]" />
          </div>
          <div className="mt-5 text-3xl md:text-5xl font-black tracking-tight animate-[letterIn_.4s_.2s_both]"><span className="text-[#111827]">CODE</span> <span className="text-blue-600">DEVS</span></div>
          <div className="flex items-center justify-center gap-3 mt-2 animate-[fadeUp_.4s_.3s_both]"><span className="h-0.5 w-10 bg-blue-600 origin-right animate-[lineGrow_.4s_.4s_both]" /><span className="tracking-[0.6em] text-sm font-semibold text-slate-700">DIGITAL</span><span className="h-0.5 w-10 bg-blue-600 origin-left animate-[lineGrow_.4s_.4s_both]" /></div>
          <p className="mt-4 text-slate-500 animate-[fadeUp_.4s_.4s_both]">Du code aux solutions.</p>
          <h1 className="mt-6 text-xl md:text-3xl font-extrabold min-h-[1.3em] animate-[fadeUp_.4s_.2s_both]"><Typer words={fr ? ["Concevoir.", "Innover.", "Connecter."] : ["Design.", "Innovate.", "Connect."]} /></h1>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-[fadeUp_.4s_.2s_both]">
            <button onClick={explore} className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white font-semibold px-7 py-3 shadow-2xl shadow-blue-600/40 hover:scale-105 transition">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {fr ? "Explorer" : "Explore"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button onClick={() => document.getElementById("about-intro")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white/70 backdrop-blur px-7 py-2.5 font-semibold hover:border-blue-500 hover:text-blue-600 transition">{fr ? "Qui sommes-nous ?" : "Who are we?"}</button>
          </div>
        </div>
        <button onClick={() => document.getElementById("about-intro")?.scrollIntoView({ behavior: "smooth" })} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce" aria-label="Défiler"><ChevronDown className="w-7 h-7" /></button>
      </section>

      {/* ABOUT */}
      <section id="about-intro" className="relative py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Reveal from="left"><span className="inline-block rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">{fr ? "À propos de l'agence" : "About the agency"}</span></Reveal>
            <Reveal from="left" delay={100}><h2 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">{fr ? <>Nous transformons vos idées en <span className="text-blue-600">solutions numériques</span>.</> : <>We turn your ideas into <span className="text-blue-600">digital solutions</span>.</>}</h2></Reveal>
            <Reveal from="left" delay={200}><p className="mt-4 text-base text-slate-600">{tr(s.heroText, lang)}</p></Reveal>
            <Reveal from="left" delay={300}><p className="mt-4 text-slate-600">{fr ? "Basée au Cameroun, CODE DEVS DIGITAL accompagne entrepreneurs, commerces et organisations : sites web, applications, e-commerce, paiements, API, bots, automatisation et intelligence artificielle — avec un suivi humain du premier échange à la maintenance." : "Based in Cameroon, CODE DEVS DIGITAL supports entrepreneurs, businesses and organizations: websites, apps, e-commerce, payments, APIs, bots, automation and AI — with human follow-up from the first conversation to maintenance."}</p></Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[["Lightbulb", fr ? "Mission" : "Mission", fr ? "Rendre le numérique accessible et utile pour chaque projet." : "Make digital accessible and useful for every project."],
              ["Eye", fr ? "Vision" : "Vision", fr ? "Devenir un partenaire numérique de référence en Afrique." : "Become a leading digital partner in Africa."],
              ["Award", fr ? "Qualité" : "Quality", fr ? "Code propre, design soigné, performances optimisées." : "Clean code, polished design, optimized performance."],
              ["HeartHandshake", fr ? "Proximité" : "Proximity", fr ? "Écoute, transparence et accompagnement durable." : "Listening, transparency and lasting support."]].map(([ic, t, b], i) => (
              <Reveal key={t} from={i % 2 ? "right" : "zoom"} delay={i * 120} className={i % 2 ? "translate-y-8" : ""}>
                <div className={`${card} p-6 h-full hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition duration-500`}>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white grid place-items-center"><Icon name={ic} className="w-5 h-5" /></div>
                  <h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm text-slate-500">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal from="zoom"><div className="grid grid-cols-2 md:grid-cols-4 rounded-[2rem] bg-gradient-to-br from-[#0b1b4d] to-blue-700 text-white overflow-hidden">
            {s.stats.map((x, i) => <div key={i} className="p-6 text-center border-white/10 [&:not(:last-child)]:border-r"><div className="text-3xl md:text-4xl font-black"><Counter value={x.value} /></div><div className="mt-1 text-sm text-blue-200">{tr(x.label, lang)}</div></div>)}
          </div></Reveal>
        </div>
      </section>

      {/* SERVICES marquee */}
      <section className="py-14 overflow-hidden">
        <Reveal><h2 className="text-center text-3xl md:text-4xl font-extrabold px-5">{fr ? "Ce que nous faisons" : "What we do"}</h2></Reveal>
        <div className="mt-10 flex gap-4 w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {[...services, ...services].map((sv, i) => (
            <div key={i} className={`${card} w-64 p-5 shrink-0`}><div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center"><Icon name={sv.icon} className="w-5 h-5" /></div><h3 className="mt-4 font-bold">{tr(sv.title, lang)}</h3><p className="mt-1 text-sm text-slate-500">{tr(sv.description, lang)}</p></div>
          ))}
        </div>
      </section>

      <HowItWorks />
      <PlatformFeatures openAI={() => openAssistant()} />
      <Commitments />
      <FAQ />

      {/* FINAL CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-[#0b1b4d]" />
        <div className="absolute w-96 h-96 -left-20 -top-20 rounded-full bg-cyan-400/30 blur-3xl animate-[blob_12s_ease-in-out_infinite]" />
        <div className="absolute w-96 h-96 -right-20 -bottom-20 rounded-full bg-blue-300/30 blur-3xl animate-[blob_16s_ease-in-out_infinite_reverse]" />
        <div className="relative text-center text-white px-5">
          <Reveal from="zoom"><LogoMark className="w-28 h-16 mx-auto drop-shadow-2xl" /></Reveal>
          <Reveal delay={100}><h2 className="mt-5 text-3xl md:text-4xl font-extrabold">{fr ? "Prêt à découvrir la suite ?" : "Ready to see more?"}</h2></Reveal>
          <Reveal delay={200}><p className="mt-3 text-blue-100 max-w-lg mx-auto">{fr ? "Explorez nos services, nos réalisations et demandez votre devis gratuit." : "Explore our services and work, and request your free quote."}</p></Reveal>
          <Reveal delay={300}><button onClick={explore} className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white text-blue-700 font-bold px-8 py-3 text-base shadow-2xl hover:scale-105 transition">{fr ? "Explorer" : "Explore"} <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition" /></button></Reveal>
        </div>
      </section>
      <footer className="py-6 text-center text-xs text-slate-500">© 2026 CODE DEVS DIGITAL. {fr ? "Tous droits réservés." : "All rights reserved."} · <a href="#/privacy" className="hover:text-blue-600">{fr ? "Confidentialité" : "Privacy"}</a></footer>
      <span className="hidden"><Lightbulb /></span>
    </div>
  );
}
