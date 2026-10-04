import { useQuery } from "@tanstack/react-query";

export type PublicContentOverlay = {
  id: string;
  resourceType: string;
  resourceKey: string;
  patch: Record<string, unknown>;
  version: number;
};

type OverlayResponse = {
  ok: boolean;
  publications?: PublicContentOverlay[];
};

export function applyContentOverlay<T extends Record<string, unknown>>(
  base: T,
  overlay: PublicContentOverlay | undefined,
): T {
  if (!overlay) return base;
  return { ...base, ...overlay.patch } as T;
}

export function useContentOverlayRegistry() {
  const query = useQuery({
    queryKey: ["ahmv-community-content-overlays"],
    queryFn: async () => {
      const response = await fetch("/api/ahmv/content-overlays", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return [] as PublicContentOverlay[];
      const payload = await response.json() as OverlayResponse;
      return Array.isArray(payload.publications) ? payload.publications : [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const overlays = query.data ?? [];
  const byKey = new Map<string, PublicContentOverlay>();
  for (const overlay of overlays) {
    const key = `${overlay.resourceType}::${overlay.resourceKey}`;
    const current = byKey.get(key);
    if (!current || overlay.version > current.version) byKey.set(key, overlay);
  }

  return {
    overlays,
    byKey,
    get(resourceType: string, resourceKey: string) {
      return byKey.get(`${resourceType}::${resourceKey}`);
    },
    apply<T extends Record<string, unknown>>(
      resourceType: string,
      resourceKey: string,
      base: T,
    ): T {
      return applyContentOverlay(base, byKey.get(`${resourceType}::${resourceKey}`));
    },
    isLoading: query.isLoading,
  };
}

export function useContentOverlay<T extends Record<string, unknown>>(
  resourceType: string,
  resourceKey: string,
  base: T,
): T {
  const registry = useContentOverlayRegistry();
  return registry.apply(resourceType, resourceKey, base);
}
