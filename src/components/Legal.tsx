import { useEffect, useState } from "react";
import { Shield, Scale, FileText, Cookie, Accessibility, Printer, ArrowUp, Mail } from "lucide-react";
import { useLang } from "../lib/app";
import { useSettings } from "../lib/db";
import { card } from "./ui";

type Block = { h: string; p?: string[]; ul?: string[] };
type Doc = { title: string; intro: string; blocks: Block[] };
const UPDATED = "2026-01-15";

function docs(fr: boolean, s: { agencyName: string; email: string; whatsapp: string; location: string }): Record<string, Doc> {
  const contact = [s.email && `E-mail : ${s.email}`, s.whatsapp && `WhatsApp : ${s.whatsapp}`].filter(Boolean).join(" · ") || (fr ? "via le formulaire de contact ou la page Support du site" : "via the contact form or the Support page");
  if (fr) return {
    privacy: {
      title: "Politique de confidentialité",
      intro: `La présente politique explique comment ${s.agencyName} collecte, utilise, conserve et protège vos données personnelles lorsque vous utilisez ce site. Nous nous engageons à traiter vos données avec transparence, dans le respect de la loi camerounaise n° 2010/012 relative à la cybersécurité et à la cybercriminalité, de la loi n° 2024/017 relative à la protection des données à caractère personnel, et des bonnes pratiques internationales (RGPD) pour nos visiteurs européens.`,
      blocks: [
        { h: "1. Responsable du traitement", p: [`${s.agencyName}, agence de développement numérique basée au ${s.location}. Contact : ${contact}.`] },
        { h: "2. Données collectées", p: ["Nous collectons uniquement les données que vous nous transmettez volontairement :"], ul: [
          "Formulaire de devis : nom, entreprise, e-mail, WhatsApp, type de service, budget, délai, description du projet.",
          "Demande de partenariat : nom, organisation, fonction, e-mail, WhatsApp, site web, proposition.",
          "Prise de rendez-vous : nom, e-mail, WhatsApp, entreprise, date, créneau, mode et sujet du rendez-vous.",
          "Tickets de support et chat : nom, e-mail facultatif, sujet et messages échangés.",
          "Avis : nom affiché, note et commentaire.",
          "Assistant IA : messages saisis ; les coordonnées que vous y partagez (e-mail, téléphone) peuvent être enregistrées comme demande de contact.",
          "Notifications push : identifiant technique d'abonnement de votre navigateur (aucune donnée nominative).",
        ] },
        { h: "3. Finalités", ul: ["Répondre à vos demandes de devis, de partenariat et de rendez-vous.", "Assurer le support client et le suivi de vos projets.", "Publier les avis approuvés.", "Vous envoyer des notifications si vous les avez activées.", "Améliorer nos services et la sécurité du site.", "Respecter nos obligations légales."] },
        { h: "4. Base légale", p: ["Les traitements reposent sur votre consentement (envoi volontaire d'un formulaire, activation des notifications), sur l'exécution de mesures précontractuelles (devis, rendez-vous) et sur notre intérêt légitime à sécuriser le site et à améliorer nos services."] },
        { h: "5. Destinataires et sous-traitants", p: ["Vos données sont accessibles uniquement aux membres habilités de l'équipe. Elles ne sont jamais vendues ni louées. Nous faisons appel aux prestataires techniques suivants :"], ul: ["Supabase — hébergement de la base de données et stockage des fichiers.", "Vercel — hébergement du site et des fonctions serveur.", "Groq — traitement des conversations avec l'assistant IA (les messages sont transmis pour générer une réponse).", "Services de notification push des navigateurs (Google, Mozilla, Apple)."] },
        { h: "6. Transferts hors du Cameroun", p: ["Certains prestataires peuvent héberger des données hors du Cameroun. Nous sélectionnons des fournisseurs offrant des garanties de sécurité reconnues (chiffrement, contrôle d'accès, conformité RGPD)."] },
        { h: "7. Durée de conservation", ul: ["Demandes de devis, partenariats, rendez-vous : 3 ans après le dernier contact.", "Tickets et messages de support : 2 ans après la clôture du ticket.", "Avis publiés : tant que le site est en ligne ou jusqu'à demande de suppression.", "Abonnements push : jusqu'à désactivation ou expiration."] },
        { h: "8. Sécurité", p: ["Nous mettons en œuvre des mesures techniques et organisationnelles adaptées : connexions chiffrées (HTTPS), règles d'accès strictes au niveau de la base de données, espace administrateur protégé par authentification, protection anti-spam des formulaires et accès aux tickets uniquement via une clé unique."] },
        { h: "9. Vos droits", p: ["Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Pour les exercer, contactez-nous : " + contact + ". Nous répondons dans un délai maximal de 30 jours."] },
        { h: "10. Stockage local et cookies", p: ["Le site n'utilise pas de cookies publicitaires. Il utilise le stockage local de votre navigateur pour mémoriser votre langue, vos clés de chat et vos préférences de notification. Voir la Politique cookies."] },
        { h: "11. Mineurs", p: ["Nos services s'adressent aux professionnels et aux adultes. Nous ne collectons pas sciemment de données concernant des personnes de moins de 18 ans."] },
        { h: "12. Modifications", p: ["Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de la page."] },
      ],
    },
    legal: {
      title: "Mentions légales",
      intro: "Conformément à la réglementation applicable aux services de communication en ligne, voici les informations relatives à l'éditeur et à l'hébergeur du site.",
      blocks: [
        { h: "Éditeur du site", ul: [`Nom commercial : ${s.agencyName}`, "Activité : développement web, applications, logiciels, intelligence artificielle, bots et solutions numériques", `Localisation : ${s.location}`, `Contact : ${contact}`, "Numéro d'immatriculation (RCCM / NIU) : à compléter par l'éditeur"] },
        { h: "Directeur de la publication", p: ["Sterben, fondateur de CODE DEVS DIGITAL."] },
        { h: "Hébergement", ul: ["Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com", "Base de données : Supabase Inc., San Francisco, États-Unis — supabase.com"] },
        { h: "Propriété intellectuelle", p: ["L'ensemble des éléments du site (textes, logo, charte graphique, illustrations, code source) est la propriété exclusive de CODE DEVS DIGITAL, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.", "Les captures d'écran des projets présentés dans le portfolio appartiennent à leurs propriétaires respectifs et sont utilisées à titre de référence. Les marques et logos des partenaires restent la propriété de leurs titulaires."] },
        { h: "Liens externes", p: ["Le site contient des liens vers des sites tiers (projets, partenaires). CODE DEVS DIGITAL n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu."] },
        { h: "Responsabilité", p: ["Nous nous efforçons de fournir des informations exactes et à jour, sans pouvoir garantir l'absence d'erreurs. Les réponses de l'assistant IA sont fournies à titre indicatif et n'engagent pas l'agence."] },
        { h: "Droit applicable", p: ["Les présentes mentions sont régies par le droit camerounais. Tout litige relève de la compétence des juridictions du Cameroun."] },
      ],
    },
    terms: {
      title: "Conditions générales d'utilisation",
      intro: `Les présentes conditions encadrent l'accès et l'utilisation du site ${s.agencyName}. En naviguant sur le site, vous acceptez ces conditions sans réserve.`,
      blocks: [
        { h: "1. Objet", p: ["Le site présente l'agence, ses services, ses réalisations, son équipe et ses partenaires, et permet de demander un devis, proposer un partenariat, réserver un rendez-vous, contacter le support, publier un avis et échanger avec un assistant IA."] },
        { h: "2. Accès au site", p: ["L'accès est gratuit et ne nécessite aucune inscription. Nous pouvons suspendre l'accès pour maintenance ou en cas de force majeure, sans préavis ni indemnité."] },
        { h: "3. Demandes de devis et rendez-vous", p: ["Toute demande de devis est gratuite et sans engagement. Seul un devis accepté et signé par les deux parties a valeur contractuelle. Les rendez-vous réservés sont soumis à confirmation de notre équipe ; nous pouvons proposer un autre créneau si nécessaire."] },
        { h: "4. Support et clé de chat", p: ["À la création d'un ticket, une clé unique vous est attribuée. Elle donne accès à la conversation : conservez-la et ne la partagez pas. Toute personne détenant la clé peut consulter l'échange."] },
        { h: "5. Avis des utilisateurs", ul: ["Les avis doivent refléter une expérience réelle avec l'agence.", "Sont interdits : propos injurieux, diffamatoires, discriminatoires, publicitaires ou hors sujet.", "Les avis sont modérés avant publication ; nous pouvons refuser ou retirer tout avis non conforme."] },
        { h: "6. Assistant IA", p: ["L'assistant utilise un modèle d'intelligence artificielle. Ses réponses peuvent comporter des imprécisions et ne constituent ni un conseil professionnel ni un engagement contractuel. Les actions proposées (envoi de devis, création de ticket) sont toujours soumises à votre confirmation. N'y saisissez pas d'informations sensibles (mots de passe, données bancaires)."] },
        { h: "7. Comportements interdits", ul: ["Tenter d'accéder sans autorisation à l'espace administrateur ou aux données d'autres utilisateurs.", "Envoyer des messages automatisés, du spam ou des contenus malveillants.", "Perturber le fonctionnement du site (attaques, surcharge, injection)."] },
        { h: "8. Propriété intellectuelle", p: ["Voir les Mentions légales. L'utilisation du site ne confère aucun droit sur ses contenus."] },
        { h: "9. Limitation de responsabilité", p: ["CODE DEVS DIGITAL ne saurait être tenue responsable des dommages indirects résultant de l'utilisation du site, d'une indisponibilité temporaire ou du contenu de sites tiers."] },
        { h: "10. Modification des conditions", p: ["Ces conditions peuvent évoluer. La version applicable est celle en ligne au moment de votre visite."] },
        { h: "11. Droit applicable", p: ["Les présentes conditions sont régies par le droit camerounais. À défaut de résolution amiable, tout litige sera porté devant les juridictions compétentes du Cameroun."] },
      ],
    },
    cookies: {
      title: "Politique cookies et stockage local",
      intro: "Nous limitons au strict nécessaire les informations stockées sur votre appareil. Aucun cookie publicitaire ni traceur tiers de mesure d'audience n'est utilisé.",
      blocks: [
        { h: "Éléments stockés", ul: ["Langue choisie (FR/EN).", "Clés de chat de vos tickets, pour reprendre vos conversations.", "Préférences de notification et notifications déjà lues.", "Pop-ups déjà fermés, pour ne pas les réafficher.", "Historique de la conversation avec l'assistant (session uniquement, effacé à la fermeture de l'onglet).", "Session administrateur (uniquement pour l'équipe)."] },
        { h: "Service worker", p: ["Si vous activez les notifications, un service worker est installé dans votre navigateur afin de recevoir et afficher les notifications push."] },
        { h: "Gérer vos préférences", p: ["Vous pouvez supprimer ces données à tout moment depuis les paramètres de votre navigateur (Effacer les données du site) et désactiver les notifications dans les réglages du site de votre navigateur."] },
      ],
    },
    accessibility: {
      title: "Déclaration d'accessibilité",
      intro: "Nous souhaitons que le site soit utilisable par tous, quel que soit l'appareil ou les capacités de chacun.",
      blocks: [
        { h: "Mesures mises en œuvre", ul: ["Structure sémantique (titres, régions, navigation).", "Lien d'évitement « Aller au contenu ».", "Textes alternatifs pour les images significatives.", "Contrastes de couleurs lisibles et tailles de police adaptables.", "Navigation complète au clavier et fermeture des fenêtres avec Échap.", "Respect du paramètre « réduire les animations » du système.", "Interface responsive sur mobile, tablette et ordinateur."] },
        { h: "Limites connues", p: ["Certaines captures de projets proviennent de sites tiers et peuvent ne pas être entièrement décrites."] },
        { h: "Signaler un problème", p: [`Si vous rencontrez une difficulté d'accès, contactez-nous (${contact}) ou ouvrez un ticket depuis la page Support. Nous vous répondrons et proposerons une alternative.`] },
      ],
    },
  };
  return {
    privacy: {
      title: "Privacy Policy",
      intro: `This policy explains how ${s.agencyName} collects, uses, stores and protects your personal data when you use this website, in line with Cameroonian law (Law No. 2010/012 on cybersecurity and Law No. 2024/017 on personal data protection) and international best practices (GDPR) for our European visitors.`,
      blocks: [
        { h: "1. Data controller", p: [`${s.agencyName}, a digital development agency based in ${s.location}. Contact: ${contact}.`] },
        { h: "2. Data we collect", p: ["We only collect data you voluntarily provide:"], ul: ["Quote form: name, company, email, WhatsApp, service type, budget, deadline, project description.", "Partnership request: name, organization, role, email, WhatsApp, website, proposal.", "Meeting booking: name, email, WhatsApp, company, date, time slot, meeting mode and topic.", "Support tickets and chat: name, optional email, subject and messages.", "Reviews: display name, rating and comment.", "AI assistant: messages typed; contact details shared there (email, phone) may be saved as a contact request.", "Push notifications: your browser's technical subscription identifier (no personal data)."] },
        { h: "3. Purposes", ul: ["Respond to quote, partnership and meeting requests.", "Provide customer support and project follow-up.", "Publish approved reviews.", "Send notifications if you enabled them.", "Improve our services and site security.", "Comply with legal obligations."] },
        { h: "4. Legal basis", p: ["Processing is based on your consent (submitting a form, enabling notifications), on pre-contractual steps (quotes, meetings) and on our legitimate interest in securing the site and improving our services."] },
        { h: "5. Recipients and processors", p: ["Your data is only accessible to authorized team members. It is never sold or rented. We use the following providers:"], ul: ["Supabase — database hosting and file storage.", "Vercel — website and serverless function hosting.", "Groq — processing AI assistant conversations.", "Browser push services (Google, Mozilla, Apple)."] },
        { h: "6. International transfers", p: ["Some providers may host data outside Cameroon. We choose providers offering recognized security guarantees (encryption, access control, GDPR compliance)."] },
        { h: "7. Retention", ul: ["Quotes, partnerships, meetings: 3 years after last contact.", "Support tickets and messages: 2 years after closing.", "Published reviews: while the site is online or until deletion is requested.", "Push subscriptions: until disabled or expired."] },
        { h: "8. Security", p: ["We apply appropriate technical and organizational measures: encrypted connections (HTTPS), strict database access rules, authenticated admin area, anti-spam form protection, and ticket access via a unique key only."] },
        { h: "9. Your rights", p: ["You have the right to access, rectify, erase, object to, restrict and port your data, and to withdraw consent at any time. To exercise them, contact us: " + contact + ". We reply within 30 days."] },
        { h: "10. Local storage and cookies", p: ["The site uses no advertising cookies. It uses your browser's local storage to remember your language, chat keys and notification preferences. See the Cookie Policy."] },
        { h: "11. Minors", p: ["Our services are intended for professionals and adults. We do not knowingly collect data from people under 18."] },
        { h: "12. Changes", p: ["This policy may be updated. The last update date is shown at the top of the page."] },
      ],
    },
    legal: {
      title: "Legal Notice",
      intro: "Information about the publisher and host of this website.",
      blocks: [
        { h: "Publisher", ul: [`Trade name: ${s.agencyName}`, "Activity: web development, apps, software, artificial intelligence, bots and digital solutions", `Location: ${s.location}`, `Contact: ${contact}`, "Registration number (RCCM / NIU): to be completed by the publisher"] },
        { h: "Publication director", p: ["Sterben, founder of CODE DEVS DIGITAL."] },
        { h: "Hosting", ul: ["Website: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com", "Database: Supabase Inc., San Francisco, USA — supabase.com"] },
        { h: "Intellectual property", p: ["All site content (texts, logo, design, illustrations, source code) is the exclusive property of CODE DEVS DIGITAL unless otherwise stated. Any reproduction or use without prior written consent is prohibited.", "Project screenshots belong to their respective owners. Partner brands and logos remain the property of their holders."] },
        { h: "External links", p: ["The site links to third-party sites (projects, partners). CODE DEVS DIGITAL has no control over them and accepts no liability for their content."] },
        { h: "Liability", p: ["We strive to provide accurate, up-to-date information but cannot guarantee it is error-free. AI assistant answers are indicative only."] },
        { h: "Governing law", p: ["This notice is governed by Cameroonian law. Any dispute falls under the jurisdiction of the courts of Cameroon."] },
      ],
    },
    terms: {
      title: "Terms of Use",
      intro: `These terms govern access to and use of the ${s.agencyName} website. By browsing the site, you accept them.`,
      blocks: [
        { h: "1. Purpose", p: ["The site presents the agency, its services, work, team and partners, and lets you request a quote, propose a partnership, book a meeting, contact support, post a review and chat with an AI assistant."] },
        { h: "2. Access", p: ["Access is free and requires no account. We may suspend access for maintenance or force majeure without notice."] },
        { h: "3. Quotes and meetings", p: ["Quote requests are free and non-binding. Only a quote accepted and signed by both parties is contractual. Booked meetings are subject to confirmation; we may suggest another slot."] },
        { h: "4. Support and chat key", p: ["A unique key is issued when you create a ticket. It grants access to the conversation: keep it safe and don't share it."] },
        { h: "5. User reviews", ul: ["Reviews must reflect a genuine experience.", "Insulting, defamatory, discriminatory, promotional or off-topic content is prohibited.", "Reviews are moderated; we may refuse or remove non-compliant reviews."] },
        { h: "6. AI assistant", p: ["The assistant uses an AI model. Its answers may be inaccurate and are neither professional advice nor a contractual commitment. Proposed actions always require your confirmation. Do not enter sensitive information (passwords, bank details)."] },
        { h: "7. Prohibited behavior", ul: ["Attempting unauthorized access to the admin area or other users' data.", "Sending automated messages, spam or malicious content.", "Disrupting the site (attacks, overload, injection)."] },
        { h: "8. Intellectual property", p: ["See the Legal Notice. Using the site grants no rights over its content."] },
        { h: "9. Limitation of liability", p: ["CODE DEVS DIGITAL is not liable for indirect damages arising from use of the site, temporary unavailability or third-party content."] },
        { h: "10. Changes", p: ["These terms may change. The applicable version is the one online at the time of your visit."] },
        { h: "11. Governing law", p: ["These terms are governed by Cameroonian law. Failing amicable resolution, disputes will be brought before the competent courts of Cameroon."] },
      ],
    },
    cookies: {
      title: "Cookie & Local Storage Policy",
      intro: "We keep what's stored on your device to the strict minimum. No advertising cookies or third-party analytics trackers are used.",
      blocks: [
        { h: "What we store", ul: ["Chosen language (FR/EN).", "Your ticket chat keys, to resume conversations.", "Notification preferences and read notifications.", "Dismissed pop-ups.", "AI assistant conversation (session only, cleared when the tab closes).", "Admin session (team only)."] },
        { h: "Service worker", p: ["If you enable notifications, a service worker is installed to receive and display push notifications."] },
        { h: "Managing preferences", p: ["You can delete this data anytime in your browser settings (Clear site data) and disable notifications in your browser's site settings."] },
      ],
    },
    accessibility: {
      title: "Accessibility Statement",
      intro: "We want this site to be usable by everyone, on any device and regardless of ability.",
      blocks: [
        { h: "Measures", ul: ["Semantic structure (headings, landmarks, navigation).", "“Skip to content” link.", "Alternative text for meaningful images.", "Readable color contrast and scalable text.", "Full keyboard navigation; dialogs close with Escape.", "Respects the system “reduce motion” setting.", "Responsive interface on mobile, tablet and desktop."] },
        { h: "Known limitations", p: ["Some project screenshots come from third-party sites and may not be fully described."] },
        { h: "Report an issue", p: [`If you have trouble accessing content, contact us (${contact}) or open a ticket from the Support page.`] },
      ],
    },
  };
}

const ICONS: Record<string, any> = { privacy: Shield, legal: Scale, terms: FileText, cookies: Cookie, accessibility: Accessibility };
export const LEGAL_PAGES = ["privacy", "legal", "terms", "cookies", "accessibility"];
const slug = (h: string) => h.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function LegalPage({ page }: { page: string }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const s = useSettings();
  const all = docs(fr, s);
  const d = all[page];
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("[data-legal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [page, lang]);
  if (!d) return null;
  const Ico = ICONS[page];
  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-b border-blue-100/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center animate-[popIn_.25s_both]"><Ico className="w-6 h-6" /></div>
          <h1 className="mt-3 text-2xl md:text-4xl font-extrabold text-[#0b1b4d] animate-[fadeUp_.3s_.05s_both]">{d.title}</h1>
          <p className="mt-2 text-xs text-slate-500">{fr ? "Dernière mise à jour" : "Last updated"} : {new Date(UPDATED).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-[230px_1fr] gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <nav aria-label={fr ? "Sommaire" : "Contents"}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{fr ? "Sommaire" : "Contents"}</div>
              {d.blocks.map((b) => <a key={b.h} href={`#/${page}`} onClick={(e) => { e.preventDefault(); document.getElementById(slug(b.h))?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className={`block border-l-2 pl-3 py-1 text-xs transition ${active === slug(b.h) ? "border-blue-600 text-blue-600 font-semibold" : "border-slate-100 text-slate-500 hover:text-[#0b1b4d]"}`}>{b.h}</a>)}
            </nav>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{fr ? "Autres documents" : "Other documents"}</div>
              {LEGAL_PAGES.filter((p) => p !== page).map((p) => { const I = ICONS[p]; return <a key={p} href={`#/${p}`} className="flex items-center gap-2 py-1 text-xs text-slate-600 hover:text-blue-600"><I className="w-3.5 h-3.5" />{all[p].title}</a>; })}
            </div>
          </div>
        </aside>
        <article className={`${card} p-6 md:p-10`}>
          <p className="text-slate-600 leading-relaxed">{d.intro}</p>
          {d.blocks.map((b) => (
            <section key={b.h} id={slug(b.h)} data-legal className="mt-8 scroll-mt-24">
              <h2 className="text-lg font-bold text-[#0b1b4d]">{b.h}</h2>
              {b.p?.map((x, i) => <p key={i} className="mt-2 text-sm text-slate-600 leading-relaxed">{x}</p>)}
              {b.ul && <ul className="mt-3 space-y-1.5">{b.ul.map((x, i) => <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{x}</li>)}</ul>}
            </section>
          ))}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
            <a href="#/support" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><Mail className="w-4 h-4" />{fr ? "Une question ? Contactez-nous" : "Questions? Contact us"}</a>
            <div className="flex gap-2">
              <button onClick={() => print()} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-400"><Printer className="w-3.5 h-3.5" />{fr ? "Imprimer" : "Print"}</button>
              <button onClick={() => scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-400"><ArrowUp className="w-3.5 h-3.5" />{fr ? "Haut de page" : "Top"}</button>
            </div>
          </div>
        </article>
      </div>
      <div className="lg:hidden max-w-6xl mx-auto px-4 pb-10 flex flex-wrap gap-2">{LEGAL_PAGES.filter((p) => p !== page).map((p) => <a key={p} href={`#/${p}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{all[p].title}</a>)}</div>
    </div>
  );
}
