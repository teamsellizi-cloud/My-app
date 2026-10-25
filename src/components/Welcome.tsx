import { useState } from "react";
import { ArrowRight, ChevronDown, MessageSquareText, FileSignature, Code2, Rocket, KeyRound, Bell, Star, ShieldCheck, Zap, Smartphone, HeartHandshake, Check } from "lucide-react";
import { useLang } from "../lib/app";
import { Section, Heading, Reveal, btn, btnOutline, card } from "./ui";
import { go } from "./Site";
import { AssistantIcon } from "./Assistant";
import type { Settings } from "../lib/defaults";

/** "Comment ça marche" — client journey from first contact to support. */
export function HowItWorks() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const steps = [
    [MessageSquareText, fr ? "1. Vous nous contactez" : "1. You contact us", fr ? "Via le formulaire de devis, WhatsApp ou notre assistant IA. Décrivez votre idée en quelques lignes." : "Through the quote form, WhatsApp or our AI assistant. Describe your idea in a few lines."],
    [FileSignature, fr ? "2. Analyse & devis" : "2. Analysis & quote", fr ? "Nous étudions votre besoin, proposons une solution adaptée et un devis clair, sans engagement." : "We study your needs and propose a tailored solution with a clear, non-binding quote."],
    [Code2, fr ? "3. Conception & développement" : "3. Design & development", fr ? "Maquette validée avec vous, puis développement par étapes avec des points réguliers." : "Mockup approved with you, then step-by-step development with regular check-ins."],
    [Rocket, fr ? "4. Livraison & suivi" : "4. Delivery & follow-up", fr ? "Tests, mise en ligne, formation, puis maintenance et support via vos tickets." : "Testing, launch, training, then maintenance and support through your tickets."],
  ] as const;
  return (
    <Section className="bg-white">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-block rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">{fr ? "Comment ça marche" : "How it works"}</span>
        <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-[#0b1b4d]">{fr ? "De l'idée au lancement, en 4 étapes" : "From idea to launch in 4 steps"}</h2>
        <p className="mt-3 text-slate-500">{fr ? "Un processus simple et transparent, pensé pour vous faire gagner du temps." : "A simple, transparent process designed to save you time."}</p>
      </div>
      <div className="relative grid md:grid-cols-4 gap-5">
        <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300" />
        {steps.map(([I, title, body], i) => (
          <Reveal key={i}><div className="relative text-center" style={{ transitionDelay: `${i * 40}ms` }}>
            <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white grid place-items-center shadow-xl shadow-blue-600/30"><I className="w-6 h-6" /></div>
            <h3 className="mt-5 font-bold text-[#0b1b4d]">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{body}</p>
          </div></Reveal>
        ))}
      </div>
    </Section>
  );
}

/** What visitors can do on the platform. */
export function PlatformFeatures({ openAI }: { openAI: () => void }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const items = [
    [AssistantIcon, fr ? "Assistant IA 24h/24" : "24/7 AI assistant", fr ? "Posez vos questions, préparez un devis ou ouvrez un ticket directement depuis la conversation." : "Ask questions, prepare a quote or open a ticket right from the conversation.", openAI],
    [KeyRound, fr ? "Support par clé unique" : "Unique-key support", fr ? "Ouvrez un ticket sans créer de compte et reprenez votre chat avec l'équipe grâce à votre clé." : "Open a ticket without an account and resume your chat with the team using your key.", () => (location.hash = "#/support")],
    [Bell, fr ? "Notifications push" : "Push notifications", fr ? "Soyez alerté des réponses à vos tickets et de nos actualités, même navigateur fermé." : "Get notified about ticket replies and news, even with your browser closed.", null],
    [Star, fr ? "Avis vérifiés" : "Moderated reviews", fr ? "Partagez votre expérience ; chaque avis est relu avant publication." : "Share your experience; each review is checked before publication.", () => (location.hash = "#/reviews")],
  ] as const;
  return (
    <Section className="bg-gradient-to-b from-blue-50/50 to-white">
      <Heading title={fr ? "Une plateforme pensée pour vous" : "A platform built for you"} sub={fr ? "Tout ce dont vous avez besoin pour échanger avec nous, sans inscription." : "Everything you need to work with us, no sign-up required."} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(([I, title, body, action], i) => (
          <Reveal key={i}><button onClick={action || undefined} className={`${card} text-left p-5 h-full w-full group hover:-translate-y-1.5 hover:shadow-xl transition duration-300`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition"><I className="w-6 h-6" /></div>
            <h3 className="mt-4 font-bold text-[#0b1b4d]">{title}</h3><p className="mt-1.5 text-sm text-slate-500">{body}</p>
          </button></Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Commitments() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const list = [
    [ShieldCheck, fr ? "Sécurité" : "Security", fr ? "Bonnes pratiques, accès protégés et données hébergées chez des fournisseurs reconnus." : "Best practices, protected access and data hosted with trusted providers."],
    [Smartphone, fr ? "Responsive" : "Responsive", fr ? "Des interfaces pensées mobile d'abord, parfaites sur tous les écrans." : "Mobile-first interfaces that look great on every screen."],
    [Zap, fr ? "Performance" : "Performance", fr ? "Sites rapides, optimisés pour le référencement et l'expérience utilisateur." : "Fast sites, optimized for SEO and user experience."],
    [HeartHandshake, fr ? "Accompagnement" : "Support", fr ? "Un interlocuteur dédié avant, pendant et après la livraison." : "A dedicated contact before, during and after delivery."],
  ] as const;
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <Reveal>
          <span className="inline-block rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">{fr ? "Nos engagements" : "Our commitments"}</span>
          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-[#0b1b4d]">{fr ? "Du code aux solutions." : "From code to solutions."}</h2>
          <p className="mt-4 text-slate-600">{fr ? "Basée au Cameroun, CODE DEVS DIGITAL accompagne entrepreneurs, commerces et organisations dans la création d'outils numériques utiles : sites, applications, e-commerce, paiements, automatisation et IA." : "Based in Cameroon, CODE DEVS DIGITAL helps entrepreneurs, businesses and organizations build useful digital tools: websites, apps, e-commerce, payments, automation and AI."}</p>
          <ul className="mt-5 space-y-2">{(fr ? ["Devis gratuit et sans engagement", "Code propre et documenté", "Suivi après livraison"] : ["Free, non-binding quote", "Clean, documented code", "Post-delivery follow-up"]).map((x) => <li key={x} className="flex gap-2 text-slate-700"><Check className="w-5 h-5 text-cyan-500" />{x}</li>)}</ul>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map(([I, t, b], i) => <Reveal key={i}><div className={`${card} p-5 h-full ${i % 2 ? "sm:translate-y-6" : ""}`}><I className="w-7 h-7 text-blue-600" /><h3 className="mt-3 font-bold text-[#0b1b4d]">{t}</h3><p className="mt-1 text-sm text-slate-500">{b}</p></div></Reveal>)}
        </div>
      </div>
    </Section>
  );
}

export function FAQ() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [open, setOpen] = useState<number | null>(0);
  const qa = fr ? [
    ["Combien coûte un projet ?", "Chaque projet est unique. Décrivez votre besoin via le formulaire de devis ou l'assistant IA et nous vous envoyons une proposition personnalisée gratuite."],
    ["Quels sont les délais ?", "Ils dépendent de la complexité. Le délai est fixé ensemble dans le devis, avec un planning par étapes."],
    ["Dois-je créer un compte ?", "Non. Le site est entièrement accessible sans inscription. Pour le support, une clé de chat unique suffit."],
    ["Comment suivre ma demande ?", "Ouvrez un ticket depuis la page Support : vous recevez une clé unique pour discuter avec l'équipe, et une notification push à chaque réponse."],
    ["Assurez-vous la maintenance ?", "Oui : mises à jour, sécurité, sauvegardes et optimisation font partie de nos services."],
  ] : [
    ["How much does a project cost?", "Every project is unique. Describe your needs via the quote form or the AI assistant and we'll send a free tailored proposal."],
    ["What are the timelines?", "They depend on complexity. The timeline is agreed together in the quote, with a staged plan."],
    ["Do I need an account?", "No. The whole site is accessible without sign-up. For support, a unique chat key is enough."],
    ["How do I track my request?", "Open a ticket from the Support page: you get a unique key to chat with the team and a push notification for each reply."],
    ["Do you offer maintenance?", "Yes: updates, security, backups and optimization are part of our services."],
  ];
  return (
    <Section className="bg-slate-50/70">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-2xl font-extrabold text-[#0b1b4d] mb-6">{fr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        <div className="space-y-3">{qa.map(([q, a], i) => (
          <div key={i} className={`${card} overflow-hidden`}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center gap-4 p-5 text-left font-semibold text-[#0b1b4d]" aria-expanded={open === i}>{q}<ChevronDown className={`w-5 h-5 text-blue-600 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} /></button>
            <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="px-5 pb-5 text-slate-600 text-sm">{a}</p></div></div>
          </div>))}</div>
      </div>
    </Section>
  );
}

export function CTA({ s, openAI }: { s: Settings; openAI: () => void }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-[#0b1b4d] p-7 md:p-10 text-white">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-cyan-400/30 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="relative max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold">{fr ? "Prêt à lancer votre projet ?" : "Ready to launch your project?"}</h2>
          <p className="mt-3 text-blue-100">{tr2(s, fr)}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button onClick={() => go("devis")} className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-blue-700 font-semibold px-6 py-3 hover:bg-blue-50 transition">{fr ? "Demander un devis" : "Request a quote"} <ArrowRight className="w-5 h-5" /></button>
            <button onClick={openAI} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 text-white font-semibold px-6 py-2.5 hover:bg-white/10 transition"><AssistantIcon className="w-5 h-5" />{fr ? "Parler à l'assistant" : "Talk to the assistant"}</button>
          </div>
        </div>
      </div>
    </Section>
  );
}
const tr2 = (_s: Settings, fr: boolean) => (fr ? "Discutons de vos objectifs. Réponse rapide, devis gratuit et accompagnement de A à Z." : "Let's discuss your goals. Fast response, free quote and end-to-end support.");

export const _unused = { btn, btnOutline };
