import { X, Building2, Handshake, CalendarCheck, FolderOpen, Mail, Star, LifeBuoy, Scale, Globe, ShoppingCart, CreditCard, Bot, Sparkles, ShieldCheck, Lightbulb, Code2, Smartphone, Server, Database, Cloud, Wrench, Rocket, Search, FileText, PenTool, FlaskConical, MessagesSquare, Send, Users, LayoutGrid, Award, Eye, HeartHandshake, Palette, Megaphone, BarChart3, Lock, Zap, Cpu, Monitor } from "lucide-react";
const Icons: Record<string, any> = { Building2, Handshake, CalendarCheck, FolderOpen, Mail, Star, LifeBuoy, Scale, Globe, ShoppingCart, CreditCard, Bot, Sparkles, ShieldCheck, Lightbulb, Code2, Smartphone, Server, Database, Cloud, Wrench, Rocket, Search, FileText, PenTool, FlaskConical, MessagesSquare, Send, Users, LayoutGrid, Award, Eye, HeartHandshake, Palette, Megaphone, BarChart3, Lock, Zap, Cpu, Monitor };
import { ReactNode, useEffect, useRef, useState } from "react";

export function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const C = Icons[name] || Code2;
  return <C className={className} aria-hidden />;
}

export function LogoMark({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="cdSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#d7dce5" /><stop offset="1" stopColor="#9aa4b5" /></linearGradient>
        <linearGradient id="cdBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b82f6" /><stop offset=".55" stopColor="#1d4ed8" /><stop offset="1" stopColor="#22d3ee" /></linearGradient>
      </defs>
      {/* C (silver) */}
      <path d="M58 4H32a28 28 0 0 0 0 56h18l8-11H32a17 17 0 0 1 0-34h18z" fill="url(#cdSilver)" stroke="#c3cad6" strokeWidth=".8" />
      {/* D (blue) */}
      <path d="M60 4h28a28 28 0 0 1 0 56H52l8-11h28a17 17 0 0 0 0-34H66z" fill="url(#cdBlue)" />
      <path d="M50 15h6l-6 8z" fill="#1d4ed8" opacity=".85" />
      {/* </> */}
      <g fill="none" stroke="#2563eb" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M46 25l-7 7 7 7M74 25l7 7-7 7" /><path d="M64 23l-8 18" />
      </g>
    </svg>
  );
}

export function Logo({ small, light }: { small?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group">
      <LogoMark className={`${small ? "w-12 h-7" : "w-14 h-8"} transition-transform duration-300 group-hover:scale-110`} />
      <div className="leading-none">
        <div className={`font-black tracking-tight ${small ? "text-[15px]" : "text-[17px]"}`}><span className={light ? "text-white" : "text-[#111827]"}>CODE</span> <span className="text-blue-600">DEVS</span></div>
        <div className={`text-[9px] font-semibold tracking-[0.45em] mt-0.5 ${light ? "text-slate-300" : "text-slate-700"}`}>DIGITAL</div>
      </div>
    </div>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`scroll-mt-20 py-10 md:py-14 ${className}`}><div className="max-w-6xl mx-auto px-4 md:px-6">{children}</div></section>;
}

export function Heading({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div><h2 className="text-xl md:text-2xl font-extrabold text-[#0b1b4d]">{title}</h2>{sub && <p className="text-slate-500 mt-1.5">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function PageHero({ title, sub, icon }: { title: string; sub?: string; icon?: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-b border-blue-100/60">
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-200/40 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute -left-16 bottom-0 w-56 h-56 rounded-full bg-cyan-200/40 blur-3xl animate-[float_10s_ease-in-out_infinite]" />
      <div className="relative max-w-6xl mx-auto px-5 py-8 md:py-12">
        {icon && <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-lg shadow-blue-600/30 animate-[popIn_.25s_ease_both]"><Icon name={icon} className="w-7 h-7" /></div>}
        <h1 className="mt-3 text-2xl md:text-4xl font-extrabold text-[#0b1b4d] animate-[fadeUp_.3s_.05s_ease_both]">{title}</h1>
        {sub && <p className="mt-3 text-slate-600 max-w-xl animate-[fadeUp_.3s_.1s_ease_both]">{sub}</p>}
      </div>
    </div>
  );
}

const FROM: Record<string, string> = { up: "translate-y-5", down: "-translate-y-5", left: "-translate-x-6", right: "translate-x-6", zoom: "scale-95", blur: "blur-sm translate-y-4" };
export function Reveal({ children, className = "", from = "up", delay = 0 }: { children: ReactNode; className?: string; from?: keyof typeof FROM; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setV(true), io.disconnect()), { threshold: 0.1 });
    ref.current && io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${Math.min(delay, 300) * 0.5}ms` }} className={`transition-all duration-[400ms] ease-[cubic-bezier(.2,.8,.2,1)] ${v ? "opacity-100 translate-x-0 translate-y-0 scale-100 blur-0" : `opacity-0 ${FROM[from]}`} ${className}`}>{children}</div>;
}

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] animate-[fadeIn_.15s_ease] bg-[#0b1b4d]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose} role="dialog" aria-modal>
      <div className={`bg-white w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} max-h-[92vh] overflow-y-auto animate-[popIn_.2s_cubic-bezier(.2,.9,.3,1.2)] rounded-t-3xl sm:rounded-3xl shadow-2xl relative`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fermer" className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow grid place-items-center text-slate-600 hover:text-blue-600"><X className="w-5 h-5" /></button>
        {children}
      </div>
    </div>
  );
}

export const btn = "inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm shadow-lg shadow-blue-600/25 transition disabled:opacity-60";
export const btnOutline = "inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-5 py-2 text-sm transition";
export const card = "bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_-12px_rgba(15,40,120,0.15)]";
export const input = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#0b1b4d] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition";
