import { lazy, Suspense, useEffect, useState } from "react";
import { LangCtx, Lang, t } from "./lib/app";
import { useSettings } from "./lib/db";
import { Header, Hero, Featured, Services, Stats, Portfolio, About, Team, Process, Reviews, QuoteContact, Footer, WhatsAppFab, NewsBlock, Partners, useHashRoute } from "./components/Site";
import { Popups, SupportPage } from "./components/Widgets";
import { LegalPage } from "./components/Legal";
import Seo from "./components/Seo";
import Assistant, { openAssistant } from "./components/Assistant";
import PushPrompt from "./components/PushPrompt";
import { CTA } from "./components/Welcome";
import Intro from "./components/Intro";
import { PartnershipPage, BookingPage } from "./components/Requests";
import { PageHero } from "./components/ui";

const Admin = lazy(() => import("./components/Admin"));

export default function App() {
  const [lang, setLangS] = useState<Lang>(() => (localStorage.getItem("cdd_lang") as Lang) || (navigator.language.startsWith("en") ? "en" : "fr"));
  const setLang = (l: Lang) => { setLangS(l); localStorage.setItem("cdd_lang", l); };
  const route = useHashRoute();
  const s = useSettings();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [route]);
  useEffect(() => { if ("serviceWorker" in navigator && localStorage.getItem("cdd_push")) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);

  if (route.startsWith("admin")) return <Suspense fallback={<div className="p-10 text-center">…</div>}><Admin /></Suspense>;

  if (route === "" || route === "welcome") return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <Seo route="" /><main key={lang} className="page-enter"><Intro /></main>
      <Assistant /><PushPrompt /><Popups screen="home" />
    </LangCtx.Provider>
  );

  const fr = lang === "fr";
  let page;
  switch (route) {
    case "services":
      page = <><PageHero icon="LayoutGrid" title={t("ourServices", lang)} sub={t("servicesSub", lang)} /><Services /><NewsBlock screen="services" /><Process /></>; break;
    case "portfolio":
      page = <><PageHero icon="FolderOpen" title={t("portfolio", lang)} sub={fr ? "Découvrez nos réalisations, filtrées par catégorie." : "Explore our work, filtered by category."} /><NewsBlock screen="portfolio" /><Portfolio /></>; break;
    case "team":
      page = <><PageHero icon="Users" title={t("team", lang)} sub={fr ? "Une équipe passionnée au service de vos projets." : "A passionate team serving your projects."} /><Team /><NewsBlock screen="team" /><About /></>; break;
    case "contact":
      page = <><PageHero icon="Mail" title={t("quote", lang)} sub={fr ? "Parlez-nous de votre projet." : "Tell us about your project."} /><QuoteContact s={s} /><NewsBlock screen="contact" /></>; break;
    case "reviews":
      page = <><PageHero icon="Star" title={t("reviews", lang)} sub={fr ? "Ce que nos clients disent de nous." : "What our clients say about us."} /><Reviews /></>; break;
    case "partners":
      page = <><PageHero icon="Building2" title={fr ? "Nos partenaires" : "Our partners"} sub={fr ? "Les organisations qui collaborent avec CODE DEVS DIGITAL." : "Organizations working with CODE DEVS DIGITAL."} /><Partners /></>; break;
    case "partnership":
      page = <><PageHero icon="Handshake" title={fr ? "Demande de partenariat" : "Partnership request"} sub={fr ? "Collaborons pour créer des solutions numériques à fort impact." : "Let's collaborate on high-impact digital solutions."} /><PartnershipPage /></>; break;
    case "booking":
      page = <><PageHero icon="CalendarCheck" title={fr ? "Prendre rendez-vous" : "Book a meeting"} sub={fr ? "Réservez un créneau pour échanger avec notre équipe." : "Book a slot to talk with our team."} /><BookingPage /></>; break;
    case "support":
      page = <><SupportPage /><NewsBlock screen="support" /></>; break;
    case "privacy": case "legal": case "terms": case "cookies": case "accessibility":
      page = <LegalPage page={route} />; break;
    default:
      page = <><Hero s={s} /><div className="-mt-4 mb-6"><Stats s={s} /></div><NewsBlock screen="home" /><Featured /><Partners compact /><Services limit={6} /><About /><Team limit={4} /><Reviews limit={3} /><CTA s={s} openAI={() => openAssistant()} /></>;
  }

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <div className="min-h-screen bg-white text-[#0b1b4d] antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-3 focus:bg-white">Aller au contenu</a>
        <Header />
        <Seo route={route} />
        <main id="main" key={route + lang} className="page-enter">{page}</main>
        <Footer s={s} />
        <WhatsAppFab s={s} />
        <Assistant />
        <PushPrompt />
        <Popups screen={["services", "portfolio", "team", "contact", "support", "partnership", "booking"].includes(route) ? route : "home"} />
      </div>
    </LangCtx.Provider>
  );
}
