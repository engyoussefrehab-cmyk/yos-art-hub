import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CmsMenuItem = {
  id: string;
  location: string;
  label_ar: string;
  label_en: string;
  url: string;
  order_index: number;
  is_external: boolean;
  open_in_new_tab: boolean;
  icon: string | null;
};

export type CmsTestimonial = {
  id: string;
  name_ar: string;
  name_en: string | null;
  role_ar: string | null;
  role_en: string | null;
  text_ar: string;
  text_en: string | null;
  rating: number;
  source: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  order_index: number;
};

export type CmsSettings = {
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  socials: Record<string, string>;
  copy: Record<string, any>;
};

type Cache = {
  menus?: Record<string, CmsMenuItem[]>;
  testimonials?: CmsTestimonial[];
  settings?: CmsSettings | null;
};

// Module-level in-memory + in-flight de-duplication caches.
const cache: Cache = {};
const inflight: Record<string, Promise<any> | undefined> = {};

function useAsyncOnce<T>(key: string, initial: T, load: () => Promise<T>): T {
  const [value, setValue] = useState<T>(() => (cache as any)[key] ?? initial);
  useEffect(() => {
    if ((cache as any)[key] !== undefined) {
      setValue((cache as any)[key]);
      return;
    }
    if (!inflight[key]) {
      inflight[key] = load().then((v) => {
        (cache as any)[key] = v;
        return v;
      });
    }
    let alive = true;
    inflight[key]!.then((v) => alive && setValue(v)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);
  return value;
}

export function useCmsMenu(location: string): CmsMenuItem[] {
  return useAsyncOnce<CmsMenuItem[]>(`menu:${location}`, [], async () => {
    const { data } = await supabase
      .from("site_menus")
      .select("id,location,label_ar,label_en,url,order_index,is_external,open_in_new_tab,icon")
      .eq("location", location)
      .eq("is_visible", true)
      .order("order_index", { ascending: true });
    return (data ?? []) as CmsMenuItem[];
  });
}

export function useCmsTestimonials(): CmsTestimonial[] {
  return useAsyncOnce<CmsTestimonial[]>("testimonials", [], async () => {
    const { data } = await supabase
      .from("testimonials")
      .select(
        "id,name_ar,name_en,role_ar,role_en,text_ar,text_en,rating,source,avatar_url,is_verified,order_index",
      )
      .eq("is_visible", true)
      .order("order_index", { ascending: true });
    return (data ?? []) as CmsTestimonial[];
  });
}

export function useCmsSettings(): CmsSettings | null {
  return useAsyncOnce<CmsSettings | null>("settings", null, async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("logo_url,contact_email,contact_phone,whatsapp_number,socials,copy")
      .eq("key", "default")
      .maybeSingle();
    if (!data) return null;
    return {
      logo_url: (data as any).logo_url ?? null,
      contact_email: (data as any).contact_email ?? null,
      contact_phone: (data as any).contact_phone ?? null,
      whatsapp_number: (data as any).whatsapp_number ?? null,
      socials: (data as any).socials ?? {},
      copy: (data as any).copy ?? {},
    } as CmsSettings;
  });
}
