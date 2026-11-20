import { useEffect, useState } from "react";
import { getPublicSiteSettings } from "@/lib/public-content.functions";
import type { Tables } from "@/integrations/supabase/types";

export type SiteSettings = Tables<"site_settings">;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublicSiteSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading, refresh: () => setLoading(true) };
}
