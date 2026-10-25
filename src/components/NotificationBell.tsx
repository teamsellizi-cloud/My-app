import { useEffect, useRef, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useTable } from "../lib/db";
import { showPush, useLang } from "../lib/app";
import { subscribePush } from "../lib/push";
import type { Notif } from "../lib/defaults";

/** Broadcast notifications + notifications targeted at the visitor's ticket keys. */
export default function NotificationBell() {
  const { lang } = useLang();
  const { rows } = useTable<Notif>("notifications", 15000);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>(() => JSON.parse(localStorage.getItem("cdd_seen") || "[]"));
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const keys: string[] = JSON.parse(localStorage.getItem("cdd_keys") || "[]");
  const mine = rows.filter((n) => !n.ticketKey || keys.includes(n.ticketKey)).reverse();
  const unread = mine.filter((n) => !seen.includes(n.id));
  const pushed = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem("cdd_pushed") || "[]")));

  useEffect(() => {
    unread.forEach((n) => {
      if (!pushed.current.has(n.id)) { pushed.current.add(n.id); showPush(n.title, n.body); }
    });
    localStorage.setItem("cdd_pushed", JSON.stringify([...pushed.current]));
  }, [unread.map((n) => n.id).join()]);

  const markAll = () => { const s = mine.map((n) => n.id); setSeen(s); localStorage.setItem("cdd_seen", JSON.stringify(s)); };
  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) setTimeout(markAll, 1500); }} className="relative p-2 rounded-full hover:bg-slate-100 text-[#0b1b4d]" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unread.length > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] grid place-items-center">{unread.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 font-bold text-[#0b1b4d]">Notifications</div>
          {perm !== "granted" && (
            <button onClick={async () => { await subscribePush(); setPerm(Notification.permission); }} className="w-full flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-sm font-semibold"><BellRing className="w-4 h-4" />{lang === "fr" ? "Activer les notifications push" : "Enable push notifications"}</button>
          )}
          <div className="max-h-80 overflow-y-auto">
            {mine.length ? mine.map((n) => (
              <div key={n.id} className={`p-4 border-b border-slate-50 ${!seen.includes(n.id) ? "bg-blue-50/40" : ""}`}><div className="font-semibold text-sm text-[#0b1b4d]">{n.title}</div><div className="text-sm text-slate-500">{n.body}</div><div className="text-[10px] text-slate-400 mt-1">{n.created_at && new Date(n.created_at).toLocaleString(lang)}</div></div>
            )) : <div className="p-6 text-center text-sm text-slate-400">{lang === "fr" ? "Aucune notification" : "No notifications"}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
