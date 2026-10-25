import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { defaultProjects, defaultServices, defaultSettings, defaultTeam } from "./defaults";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
export const usingSupabase = !!supabase;

export type Table = "projects" | "services" | "team" | "settings" | "popups" | "news" | "notifications" | "quotes" | "reviews" | "tickets" | "messages" | "leads" | "secrets" | "partnerships" | "meetings" | "partners";

const seeds: Partial<Record<Table, any[]>> = { projects: defaultProjects, services: defaultServices, team: defaultTeam, settings: [defaultSettings] };

const lsKey = (t: Table) => `cdd_${t}`;
function lsRead(t: Table): any[] {
  const raw = localStorage.getItem(lsKey(t));
  if (raw) try { return JSON.parse(raw); } catch { /* ignore */ }
  return seeds[t] ? structuredClone(seeds[t]!) : [];
}
const lsWrite = (t: Table, rows: any[]) => { localStorage.setItem(lsKey(t), JSON.stringify(rows)); window.dispatchEvent(new Event("cdd-db")); };

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

/** Every table uses the same shape: id (text PK), data (jsonb), created_at. */
export async function list<T = any>(t: Table): Promise<T[]> {
  if (supabase) {
    const { data, error } = await supabase.from(t).select("id,data,created_at").order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data || []).map((r: any) => ({ ...r.data, id: r.id, created_at: r.created_at }));
    if (!rows.length && seeds[t]) return structuredClone(seeds[t]!) as T[];
    return rows as T[];
  }
  return lsRead(t) as T[];
}

export async function save<T extends Record<string, any> = any>(t: Table, row: T): Promise<T> {
  const isNew = !row.id;
  const r: any = { ...row, id: row.id || uid() };
  if (!r.created_at) r.created_at = new Date().toISOString();
  if (supabase) {
    const { id, created_at, ...data } = r;
    const q = supabase.from(t);
    const { error } = isNew ? await q.insert({ id, data, created_at }) : await q.upsert({ id, data, created_at });
    if (error) throw error;
    window.dispatchEvent(new Event("cdd-db"));
    return r;
  }
  const rows = lsRead(t);
  const i = rows.findIndex((x) => x.id === r.id);
  if (i >= 0) rows[i] = r; else rows.push(r);
  lsWrite(t, rows);
  return r;
}

export async function remove(t: Table, id: string) {
  if (supabase) {
    const { error } = await supabase.from(t).delete().eq("id", id);
    if (error) throw error;
    window.dispatchEvent(new Event("cdd-db"));
    return;
  }
  lsWrite(t, lsRead(t).filter((x) => x.id !== id));
}

/** Upload a file to Supabase Storage (bucket "media") or fall back to a data URL. */
export async function uploadFile(file: File): Promise<string> {
  if (supabase) {
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(file); });
}

export function useTable<T = any>(t: Table, pollMs = 0) {
  const [rows, setRows] = useState<T[]>(() => (supabase ? (seeds[t] as T[]) || [] : lsRead(t)));
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => list<T>(t).then(setRows).catch(console.error).finally(() => setLoading(false)), [t]);
  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("cdd-db", h);
    window.addEventListener("storage", h);
    const iv = pollMs ? setInterval(reload, pollMs) : undefined;
    return () => { window.removeEventListener("cdd-db", h); window.removeEventListener("storage", h); if (iv) clearInterval(iv); };
  }, [reload, pollMs]);
  return { rows, loading, reload };
}

export function useSettings() {
  const { rows } = useTable<any>("settings");
  return { ...defaultSettings, ...(rows.find((r) => r.id === "site") || {}) } as typeof defaultSettings;
}

/** Ticket access by secret key only (Supabase RPC, security definer — anon can't list tickets). */
export async function findTicket(key: string): Promise<any | null> {
  if (supabase) {
    const { data, error } = await supabase.rpc("get_ticket", { p_key: key });
    if (error || !data) return null;
    return { ...data.data, id: data.id, created_at: data.created_at };
  }
  return lsRead("tickets").find((t) => t.key === key) || null;
}
export async function ticketMessages(key: string): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase.rpc("get_ticket_messages", { p_key: key });
    if (error) return [];
    return (data || []).map((r: any) => ({ ...r.data, id: r.id, created_at: r.created_at }));
  }
  return lsRead("messages").filter((m) => m.ticketKey === key);
}

/** Booked time slots for a date (only times are exposed publicly via RPC). */
export async function bookedSlots(date: string): Promise<string[]> {
  if (supabase) {
    const { data, error } = await supabase.rpc("get_booked_slots", { p_date: date });
    if (error) return [];
    return (data || []).map((r: any) => r.time ?? r);
  }
  return lsRead("meetings").filter((m) => m.date === date && m.status !== "cancelled").map((m) => m.time);
}
