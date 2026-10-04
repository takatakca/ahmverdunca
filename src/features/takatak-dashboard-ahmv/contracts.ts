export const TAKATAK_AHMV_TENANT = "ahmverdun" as const;
export const TAKATAK_AHMV_PRODUCT = "ahmv" as const;

export const TAKATAK_AHMV_SERVICES = [
  "website",
  "domain",
  "hosting",
  "seo",
  "social",
  "local_listing",
  "blog",
  "reviews",
  "lead_calls",
  "notifications",
  "sms",
  "voice",
  "email",
  "calendar",
  "analytics",
  "automations",
] as const;

export type TakatakAhmvService = (typeof TAKATAK_AHMV_SERVICES)[number];

export const TAKATAK_AHMV_ACTIONS = [
  "read",
  "save_draft",
  "publish",
  "archive",
  "restore",
  "delete",
  "execute",
] as const;

export type TakatakAhmvAction = (typeof TAKATAK_AHMV_ACTIONS)[number];

export type TakatakAhmvControlContext = {
  tenant: typeof TAKATAK_AHMV_TENANT;
  product: typeof TAKATAK_AHMV_PRODUCT;
  organizationId: string;
  actorId: string;
  requestId: string;
  services: TakatakAhmvService[];
};

export type TakatakAhmvModuleManifest = {
  schemaVersion: 1;
  tenant: typeof TAKATAK_AHMV_TENANT;
  product: typeof TAKATAK_AHMV_PRODUCT;
  standaloneApplication: true;
  autoMountInDashboard: false;
  requiresExplicitSubscription: true;
  billingAuthority: "takatak";
  hockeyDataAuthority: "official_provider_or_ahmv";
  services: readonly TakatakAhmvService[];
};

export const TAKATAK_AHMV_MANIFEST: TakatakAhmvModuleManifest = {
  schemaVersion: 1,
  tenant: TAKATAK_AHMV_TENANT,
  product: TAKATAK_AHMV_PRODUCT,
  standaloneApplication: true,
  autoMountInDashboard: false,
  requiresExplicitSubscription: true,
  billingAuthority: "takatak",
  hockeyDataAuthority: "official_provider_or_ahmv",
  services: TAKATAK_AHMV_SERVICES,
};
