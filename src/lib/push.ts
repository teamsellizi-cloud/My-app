import { supabase } from "./db";

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;

function b64ToUint8(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Ask permission, register the SW and (when VAPID is configured) create a real Web Push subscription
 *  stored server-side so notifications arrive even when the site is closed. Optionally link a ticket key. */
export async function subscribePush(ticketKey?: string): Promise<boolean> {
  if (!pushSupported()) return false;
  const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (perm !== "granted") return false;
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  localStorage.setItem("cdd_push", "1");
  if (!VAPID || !("PushManager" in window)) return true; // local notifications only
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(VAPID) });
  const keys: string[] = JSON.parse(localStorage.getItem("cdd_keys") || "[]");
  if (ticketKey && !keys.includes(ticketKey)) keys.push(ticketKey);
  await fetch("/api/push-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), ticketKeys: keys }) }).catch(() => {});
  return true;
}

/** Admin: send a real push through the serverless function (requires Supabase session). */
export async function sendPush(payload: { title: string; body: string; ticketKey?: string; url?: string }) {
  if (!supabase) return { ok: false, reason: "demo" };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const r = await fetch("/api/push-send", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }).catch(() => null);
  return r && r.ok ? await r.json() : { ok: false };
}
