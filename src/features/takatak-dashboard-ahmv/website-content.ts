import { z } from "zod";

const localized = z
  .object({
    fr: z.string().trim().min(1).max(20_000),
    en: z.string().trim().max(20_000).optional(),
  })
  .strict();

const optionalLocalized = z
  .object({
    fr: z.string().trim().max(20_000).optional(),
    en: z.string().trim().max(20_000).optional(),
  })
  .strict();

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "unsupported_url_protocol");

const pageContent = z
  .object({
    title: localized.optional(),
    summary: localized.optional(),
    body: localized.optional(),
    sourceUrl: httpsUrl.optional(),
    validated: z.boolean().optional(),
  })
  .strict();

const arenaInfo = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    borough: localized.optional(),
    address: z.string().trim().min(1).max(500).optional(),
    addressVerified: z.boolean().optional(),
    website: httpsUrl.optional(),
    facilities: optionalLocalized.optional(),
  })
  .strict();

const newsLink = z
  .object({
    label: localized,
    url: httpsUrl,
  })
  .strict();

const newsPost = z
  .object({
    title: localized.optional(),
    excerpt: localized.optional(),
    body: z
      .object({
        fr: z.array(z.string().trim().min(1).max(20_000)).max(100).optional(),
        en: z.array(z.string().trim().min(1).max(20_000)).max(100).optional(),
      })
      .strict()
      .optional(),
    author: z.string().trim().min(1).max(200).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    publishedLabel: localized.optional(),
    sourceUrl: httpsUrl.optional(),
    links: z.array(newsLink).max(25).optional(),
    contentPending: z.boolean().optional(),
  })
  .strict();

const faqEntry = z
  .object({
    question: localized.optional(),
    answer: localized.optional(),
    sourcePath: z.string().trim().min(1).max(300).optional(),
    validated: z.boolean().optional(),
  })
  .strict();

const galleryAlbum = z
  .object({
    title: localized.optional(),
    description: localized.optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    eventType: localized.optional(),
    coverUrl: httpsUrl.optional(),
    sourceUrl: httpsUrl.optional(),
    photoCount: z.number().int().min(0).max(100_000).optional(),
    photosPending: z.boolean().optional(),
  })
  .strict();

const galleryPhoto = z
  .object({
    sourceUrl: httpsUrl.optional(),
    mediaUrl: httpsUrl.optional(),
    alt: localized.optional(),
    label: localized.optional(),
    containsMinors: z.boolean().optional(),
  })
  .strict();

const teamPublicInfo = z
  .object({
    description: localized.optional(),
    contactEmail: z.string().trim().email().optional(),
    website: httpsUrl.optional(),
    facebookUrl: httpsUrl.optional(),
    instagramUrl: httpsUrl.optional(),
    sourceUrl: httpsUrl.optional(),
  })
  .strict();

const scheduleNotice = z
  .object({
    message: localized,
    severity: z.enum(["info", "important", "urgent"]),
    sourceUrl: httpsUrl.optional(),
    startsAt: z.string().datetime({ offset: true }).optional(),
    expiresAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const sponsor = z
  .object({
    displayName: z.string().trim().min(1).max(200).optional(),
    description: localized.optional(),
    website: httpsUrl.optional(),
    phone: z.string().trim().min(7).max(40).optional(),
    address: z.string().trim().max(500).optional(),
    logoUrl: httpsUrl.optional(),
    active: z.boolean().optional(),
  })
  .strict();

const advertisement = z
  .object({
    headline: localized.optional(),
    body: localized.optional(),
    ctaLabel: localized.optional(),
    ctaUrl: httpsUrl.optional(),
    mediaUrl: httpsUrl.optional(),
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    active: z.boolean().optional(),
  })
  .strict();

const redirect = z
  .object({
    target: z.string().trim().min(1).max(1_000),
    statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
    active: z.boolean().optional(),
  })
  .strict();

export const WEBSITE_CONTROL_RESOURCE_TYPES = [
  "page_content",
  "arena_info",
  "news_post",
  "faq_entry",
  "gallery_album",
  "gallery_photo",
  "team_public_info",
  "schedule_notice",
  "sponsor",
  "advertisement",
  "redirect",
] as const;

export type WebsiteControlResourceType =
  (typeof WEBSITE_CONTROL_RESOURCE_TYPES)[number];

const SCHEMAS: Record<WebsiteControlResourceType, z.ZodTypeAny> = {
  page_content: pageContent,
  arena_info: arenaInfo,
  news_post: newsPost,
  faq_entry: faqEntry,
  gallery_album: galleryAlbum,
  gallery_photo: galleryPhoto,
  team_public_info: teamPublicInfo,
  schedule_notice: scheduleNotice,
  sponsor,
  advertisement,
  redirect,
};

export function isWebsiteControlResourceType(
  value: string,
): value is WebsiteControlResourceType {
  return WEBSITE_CONTROL_RESOURCE_TYPES.includes(
    value as WebsiteControlResourceType,
  );
}

export function parseWebsiteControlPayload(
  resourceType: string,
  payload: unknown,
) {
  if (!isWebsiteControlResourceType(resourceType)) {
    throw new Error("unsupported_website_control_resource_type");
  }

  const result = SCHEMAS[resourceType].safeParse(payload);
  if (!result.success) {
    throw new Error("invalid_website_control_payload");
  }
  return result.data;
}
