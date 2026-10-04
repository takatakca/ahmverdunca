import { z } from "zod";

const localized = z
  .object({
    fr: z.string().trim().min(1).max(160).optional(),
    en: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

const description = z
  .object({
    fr: z.string().trim().min(1).max(320).optional(),
    en: z.string().trim().min(1).max(320).optional(),
  })
  .strict();

const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "unsupported_url_protocol");

const pageMeta = z
  .object({
    title: localized.optional(),
    description: description.optional(),
    canonicalUrl: httpUrl.optional(),
    noindex: z.boolean().optional(),
    nofollow: z.boolean().optional(),
    ogImageUrl: httpUrl.optional(),
  })
  .strict();

const redirectMeta = z
  .object({
    fromPath: z.string().trim().startsWith("/").max(500),
    toPathOrUrl: z.string().trim().min(1).max(1_000),
    statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
    active: z.boolean().optional(),
  })
  .strict();

export const SEO_CONTROL_RESOURCE_TYPES = [
  "page_meta",
  "redirect_rule",
] as const;

export type SeoControlResourceType =
  (typeof SEO_CONTROL_RESOURCE_TYPES)[number];

const SCHEMAS: Record<SeoControlResourceType, z.ZodTypeAny> = {
  page_meta: pageMeta,
  redirect_rule: redirectMeta,
};

export function isSeoControlResourceType(
  value: string,
): value is SeoControlResourceType {
  return SEO_CONTROL_RESOURCE_TYPES.includes(value as SeoControlResourceType);
}

export function parseSeoControlPayload(resourceType: string, payload: unknown) {
  if (!isSeoControlResourceType(resourceType)) {
    throw new Error("unsupported_seo_control_resource_type");
  }
  const result = SCHEMAS[resourceType].safeParse(payload);
  if (!result.success) throw new Error("invalid_seo_control_payload");
  return result.data;
}
