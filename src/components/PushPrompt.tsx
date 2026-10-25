import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { useLang } from "../lib/app";
import { pushSupported, subscribePush } from "../lib/push";

/** Gentle opt-in banner shown after a few seconds, once, if permission not decided. */
export default function PushPrompt() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!pushSupported() || Notification.permission !== "default" || localStorage.getItem("cdd_push_prompt")) return;
    const id = setTimeout(() => setShow(true), 9000);
    return () => clearTimeout(id);
  }, []);
  if (!show) return null;
  const close = () => { localStorage.setItem("cdd_push_prompt", "1"); setShow(false); };
  return (
    <div className="fixed z-[70] left-3 right-3 sm:left-auto sm:right-5 top-20 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex gap-3 animate-[slideDown_.4s_ease]" role="dialog">
      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white grid place-items-center shrink-0"><BellRing className="w-5 h-5" /></div>
      <div className="flex-1">
        <div className="font-bold text-[#0b1b4d] text-sm">{fr ? "Restez informé" : "Stay informed"}</div>
        <p className="text-xs text-slate-500 mt-0.5">{fr ? "Recevez nos actualités et les réponses à vos tickets en notification." : "Get our news and ticket replies as notifications."}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={async () => { await subscribePush(); close(); }} className="rounded-full bg-blue-600 text-white text-xs font-semibold px-4 py-2">{fr ? "Activer" : "Enable"}</button>
          <button onClick={close} className="rounded-full text-slate-500 text-xs font-semibold px-3 py-2 hover:bg-slate-100">{fr ? "Plus tard" : "Later"}</button>
        </div>
      </div>
      <button onClick={close} aria-label="Fermer" className="text-slate-400 self-start"><X className="w-4 h-4" /></button>
    </div>
  );
}
