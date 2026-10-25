import { useEffect } from "react";
import { useLang } from "../lib/app";
import { useSettings, useTable } from "../lib/db";
import type { Project, Service } from "../lib/defaults";

export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string) || (typeof location !== "undefined" ? location.origin : "")).replace(/\/$/, "");

const META: Record<string, { fr: [string, string]; en: [string, string] }> = {
  "": { fr: ["CODE DEVS DIGITAL — Agence de développement web, apps & IA au Cameroun", "Du code aux solutions. Création de sites web, applications, e-commerce, paiements, API, bots et intelligence artificielle au Cameroun."], en: ["CODE DEVS DIGITAL — Web, App & AI Development Agency in Cameroon", "From code to solutions. Websites, apps, e-commerce, payments, APIs, bots and AI built in Cameroon."] },
  home: { fr: ["Accueil — CODE DEVS DIGITAL", "Concevoir. Innover. Connecter. Découvrez nos services, réalisations et notre équipe."], en: ["Home — CODE DEVS DIGITAL", "Design. Innovate. Connect. Discover our services, work and team."] },
  services: { fr: ["Services — Sites web, e-commerce, paiements, IA | CODE DEVS DIGITAL", "Création de sites et applications, plateformes e-commerce, intégrations de paiement, API, bots, IA, maintenance et conseil numérique."], en: ["Services — Websites, e-commerce, payments, AI | CODE DEVS DIGITAL", "Websites and apps, e-commerce platforms, payment integrations, APIs, bots, AI, maintenance and digital consulting."] },
  portfolio: { fr: ["Portfolio — Nos réalisations | CODE DEVS DIGITAL", "Systemic Agent, PayLinky, InstantBoost, Sellizi, Kalyvilo Shop, AfrisendPay, Longrich : découvrez nos projets."], en: ["Portfolio — Our work | CODE DEVS DIGITAL", "Systemic Agent, PayLinky, InstantBoost, Sellizi, Kalyvilo Shop, AfrisendPay, Longrich: explore our projects."] },
  team: { fr: ["Équipe — CODE DEVS DIGITAL", "Rencontrez l'équipe : développement, conception, marketing digital et relation client."], en: ["Team — CODE DEVS DIGITAL", "Meet the team: development, design, digital marketing and client relations."] },
  contact: { fr: ["Demander un devis gratuit — CODE DEVS DIGITAL", "Décrivez votre projet et recevez un devis personnalisé, gratuit et sans engagement."], en: ["Request a free quote — CODE DEVS DIGITAL", "Describe your project and receive a free, tailored, non-binding quote."] },
  partners: { fr: ["Nos partenaires — CODE DEVS DIGITAL", "Les organisations qui collaborent avec CODE DEVS DIGITAL."], en: ["Our partners — CODE DEVS DIGITAL", "Organizations working with CODE DEVS DIGITAL."] },
  partnership: { fr: ["Demande de partenariat — CODE DEVS DIGITAL", "Proposez un partenariat technique, commercial ou stratégique à CODE DEVS DIGITAL."], en: ["Partnership request — CODE DEVS DIGITAL", "Propose a technical, commercial or strategic partnership."] },
  booking: { fr: ["Prendre rendez-vous — CODE DEVS DIGITAL", "Réservez un créneau en visio, par téléphone ou en présentiel avec notre équipe."], en: ["Book a meeting — CODE DEVS DIGITAL", "Book a video, phone or in-person slot with our team."] },
  reviews: { fr: ["Avis clients — CODE DEVS DIGITAL", "Ce que nos clients disent de CODE DEVS DIGITAL."], en: ["Client reviews — CODE DEVS DIGITAL", "What our clients say about CODE DEVS DIGITAL."] },
  support: { fr: ["Support client — CODE DEVS DIGITAL", "Ouvrez un ticket et discutez avec notre équipe grâce à votre clé unique."], en: ["Customer support — CODE DEVS DIGITAL", "Open a ticket and chat with our team using your unique key."] },
  privacy: { fr: ["Politique de confidentialité — CODE DEVS DIGITAL", "Comment nous collectons, utilisons et protégeons vos données personnelles."], en: ["Privacy Policy — CODE DEVS DIGITAL", "How we collect, use and protect your personal data."] },
  legal: { fr: ["Mentions légales — CODE DEVS DIGITAL", "Éditeur, hébergement, propriété intellectuelle et droit applicable."], en: ["Legal Notice — CODE DEVS DIGITAL", "Publisher, hosting, intellectual property and governing law."] },
  terms: { fr: ["Conditions d'utilisation — CODE DEVS DIGITAL", "Règles d'accès et d'utilisation du site et de ses services."], en: ["Terms of Use — CODE DEVS DIGITAL", "Rules for accessing and using the site and its services."] },
  cookies: { fr: ["Politique cookies — CODE DEVS DIGITAL", "Stockage local et cookies utilisés sur le site."], en: ["Cookie Policy — CODE DEVS DIGITAL", "Local storage and cookies used on the site."] },
  accessibility: { fr: ["Accessibilité — CODE DEVS DIGITAL", "Notre engagement pour un site accessible à tous."], en: ["Accessibility — CODE DEVS DIGITAL", "Our commitment to an accessible website."] },
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
}
function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) { el = document.createElement("link"); el.rel = rel; if (hreflang) el.hreflang = hreflang; document.head.appendChild(el); }
  el.href = href;
}
function setJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = id; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

/** Per-route title, description, Open Graph, Twitter, canonical, hreflang and JSON-LD structured data. */
export default function Seo({ route }: { route: string }) {
  const { lang } = useLang();
  const s = useSettings();
  const { rows: services } = useTable<Service>("services");
  const { rows: projects } = useTable<Project>("projects");

  useEffect(() => {
    const m = (META[route] || META[""])[lang];
    const url = `${SITE_URL}/${route ? "#/" + route : ""}`;
    document.title = m[0];
    setMeta("name", "description", m[1]);
    setMeta("name", "robots", route.startsWith("admin") ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", m[0]);
    setMeta("property", "og:description", m[1]);
    setMeta("property", "og:url", url);
    setMeta("property", "og:locale", lang === "fr" ? "fr_FR" : "en_US");
    setMeta("name", "twitter:title", m[0]);
    setMeta("name", "twitter:description", m[1]);
    setLink("canonical", url);
    setLink("alternate", url, "fr");
    setLink("alternate", url, "en");
    setLink("alternate", url, "x-default");

    const sameAs = Object.values(s.socials || {}).filter(Boolean);
    setJsonLd("ld-org", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "ProfessionalService"], "@id": `${SITE_URL}/#org`, name: s.agencyName, url: SITE_URL, logo: `${SITE_URL}/icon-512.png`, image: `${SITE_URL}/og-image.jpg`,
          slogan: "Du code aux solutions.", description: META[""][lang][1],
          address: { "@type": "PostalAddress", addressCountry: "CM" }, areaServed: ["CM", "Africa"],
          ...(s.email && { email: s.email }), ...(s.whatsapp && { telephone: s.whatsapp }), ...(sameAs.length && { sameAs }),
          founder: { "@type": "Person", name: "Sterben" },
          knowsAbout: ["Web development", "Mobile apps", "E-commerce", "Payment integration", "APIs", "Chatbots", "Artificial intelligence"],
          hasOfferCatalog: { "@type": "OfferCatalog", name: "Services", itemListElement: services.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.title[lang], description: x.description[lang] } })) },
        },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: s.agencyName, inLanguage: ["fr", "en"], publisher: { "@id": `${SITE_URL}/#org` } },
        ...(route === "portfolio" ? [{ "@type": "ItemList", name: "Portfolio", itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: p.name, url: p.url, description: p.description[lang] } })) }] : []),
        ...(route && route !== "home" ? [{ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/#/home` }, { "@type": "ListItem", position: 2, name: m[0].split(" — ")[0], item: url }] }] : []),
      ],
    });
  }, [route, lang, s, services, projects]);
  return null;
}
