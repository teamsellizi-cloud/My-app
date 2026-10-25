export type L = { fr: string; en: string };
export type Project = { id: string; name: string; url: string; category: string; logo?: string; screenshot?: string; description: L; tech: string[]; features: string[]; featured?: boolean; order?: number };
export type Partner = { id: string; name: string; logo?: string; image?: string; website?: string; category?: string; description: L; featured?: boolean; order?: number };
export type Service = { id: string; icon: string; title: L; description: L; order?: number };
export type Member = { id: string; name: string; role: L; bio: L; avatar?: string; order?: number };
export type Settings = {
  id: "site"; agencyName: string; slogan: L; heroText: L; whatsapp: string; email: string; location: string; hours: L;
  socials: { facebook?: string; instagram?: string; linkedin?: string; tiktok?: string; github?: string };
  stats: { value: string; label: L }[];
  aiEnabled: boolean; groqKey: string; groqModel: string; aiPrompt: string;
};
export type Popup = { id: string; title: L; body: L; image?: string; ctaLabel?: string; ctaUrl?: string; screen: string; active: boolean; created_at?: string };
export type News = { id: string; title: L; body: L; image?: string; screen: string; created_at?: string };
export type Notif = { id: string; title: string; body: string; ticketKey?: string; created_at?: string };
export type Quote = { id: string; name: string; company?: string; email: string; whatsapp?: string; service: string; budget?: string; deadline?: string; description: string; status: string; created_at?: string };
export type Review = { id: string; name: string; rating: number; comment: string; approved: boolean; created_at?: string };
export type Ticket = { id: string; key: string; name: string; email?: string; subject: string; status: string; created_at?: string };
export type Message = { id: string; ticketKey: string; from: "user" | "admin"; text: string; created_at?: string };
export type Lead = { id: string; name?: string; email?: string; whatsapp?: string; need?: string; source: string; created_at?: string };

const shot = (u: string) => `https://image.thum.io/get/width/900/crop/620/noanimate/${u}`;

export const defaultSettings: Settings = {
  id: "site", agencyName: "CODE DEVS DIGITAL",
  slogan: { fr: "Concevoir. Innover. Connecter.", en: "Design. Innovate. Connect." },
  heroText: {
    fr: "CODE DEVS DIGITAL conçoit des sites web, applications, logiciels, solutions d'IA, bots et outils numériques sur mesure pour transformer vos idées en projets concrets.",
    en: "CODE DEVS DIGITAL builds custom websites, apps, software, AI solutions, bots and digital tools that turn your ideas into real projects.",
  },
  whatsapp: "", email: "", location: "Cameroun",
  hours: { fr: "Lun – Sam : à configurer", en: "Mon – Sat: to be configured" },
  socials: {},
  stats: [
    { value: "7", label: { fr: "Projets en ligne", en: "Live projects" } },
    { value: "12+", label: { fr: "Technologies", en: "Technologies" } },
    { value: "4", label: { fr: "Membres", en: "Team members" } },
    { value: "7", label: { fr: "Services", en: "Services" } },
  ],
  aiEnabled: true, groqKey: "", groqModel: "llama-3.3-70b-versatile",
  aiPrompt: "Tu es l'assistant de CODE DEVS DIGITAL, agence numérique au Cameroun. Réponds en français ou anglais selon l'utilisateur, de façon concise et professionnelle. Présente les services, projets et l'équipe. Invite poliment l'utilisateur à donner son nom, e-mail ou WhatsApp et son besoin, puis propose de demander un devis ou d'ouvrir un ticket de support. N'invente jamais de prix, coordonnées ou fonctionnalités.",
};

const d = (fr: string, en: string): L => ({ fr, en });
export const defaultProjects: Project[] = [
  { id: "p1", name: "Systemic Agent", url: "https://systemic-agent.vercel.app/", category: "IA", screenshot: shot("https://systemic-agent.vercel.app/"), description: d("Assistant intelligent basé sur l'IA.", "AI-powered intelligent assistant."), tech: ["Web App", "Vercel"], features: [], featured: true, order: 1 },
  { id: "p2", name: "PayLinky", url: "https://paylinky.vercel.app/", category: "Paiement", screenshot: shot("https://paylinky.vercel.app/"), description: d("Solution de paiement par liens.", "Payment link solution."), tech: ["Web App", "Vercel"], features: [], featured: true, order: 2 },
  { id: "p3", name: "InstantBoost", url: "https://instantboost.vercel.app/", category: "Marketing", screenshot: shot("https://instantboost.vercel.app/"), description: d("Plateforme web de services de visibilité.", "Web platform for visibility services."), tech: ["Web App", "Vercel"], features: [], featured: true, order: 3 },
  { id: "p4", name: "Sellizi", url: "https://sellizi.store/", category: "E-commerce", screenshot: shot("https://sellizi.store/"), description: d("Plateforme e-commerce.", "E-commerce platform."), tech: ["Web"], features: [], order: 4 },
  { id: "p5", name: "Kalyvilo Shop", url: "https://kalyviloshop.vercel.app/", category: "E-commerce", screenshot: shot("https://kalyviloshop.vercel.app/"), description: d("Boutique en ligne.", "Online shop."), tech: ["Web App", "Vercel"], features: [], order: 5 },
  { id: "p6", name: "AfrisendPay", url: "https://afrisendpay.kesug.com/", category: "Paiement", screenshot: shot("https://afrisendpay.kesug.com/"), description: d("Solution de paiement et transfert.", "Payment & transfer solution."), tech: ["Web"], features: [], order: 6 },
  { id: "p7", name: "Longrich", url: "https://longrich.site/", category: "Site vitrine", screenshot: shot("https://longrich.site/"), description: d("Site web de présentation.", "Showcase website."), tech: ["Web"], features: [], order: 7 },
];

export const defaultServices: Service[] = [
  { id: "s1", icon: "Globe", title: d("Sites web & applications", "Websites & apps"), description: d("Sites vitrines, web apps et applications sur mesure.", "Showcase sites, web apps and custom applications."), order: 1 },
  { id: "s2", icon: "ShoppingCart", title: d("Plateformes e-commerce", "E-commerce platforms"), description: d("Boutiques en ligne et solutions marchandes.", "Online stores and merchant solutions."), order: 2 },
  { id: "s3", icon: "CreditCard", title: d("Paiements & intégrations", "Payments & integrations"), description: d("Intégration de paiements sécurisés et multi-moyens.", "Secure, multi-method payment integration."), order: 3 },
  { id: "s4", icon: "Bot", title: d("API, bots & automatisation", "APIs, bots & automation"), description: d("API, chatbots et automatisation de processus.", "APIs, chatbots and process automation."), order: 4 },
  { id: "s5", icon: "Sparkles", title: d("Intelligence artificielle", "Artificial intelligence"), description: d("Assistants IA et intégration de modèles.", "AI assistants and model integration."), order: 5 },
  { id: "s6", icon: "ShieldCheck", title: d("Maintenance & sécurité", "Maintenance & security"), description: d("Mises à jour, sécurité et optimisation des performances.", "Updates, security and performance tuning."), order: 6 },
  { id: "s7", icon: "Lightbulb", title: d("Conseil numérique", "Digital consulting"), description: d("Accompagnement dans votre transformation numérique.", "Guidance for your digital transformation."), order: 7 },
];

export const defaultTeam: Member[] = [
  { id: "t1", name: "Sterben", role: d("Fondateur", "Founder"), bio: d("Coordination, conception et supervision technique.", "Coordination, design and technical supervision."), order: 1 },
  { id: "t2", name: "Honest", role: d("Développeur", "Developer"), bio: d("Développement web et applications.", "Web and app development."), order: 2 },
  { id: "t3", name: "Mame", role: d("Marketing digital", "Digital marketing"), bio: d("Marketing digital et réseaux sociaux.", "Digital marketing and social media."), order: 3 },
  { id: "t4", name: "Raùl", role: d("Commercial", "Sales"), bio: d("Prospection commerciale et suivi des clients.", "Business development and client follow-up."), order: 4 },
];

export const TECH = ["HTML", "CSS", "JavaScript", "React", "Node.js", "PHP", "MySQL", "Supabase", "API", "Git", "GitHub", "Vercel"];
