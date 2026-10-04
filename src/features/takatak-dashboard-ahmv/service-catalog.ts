import type { TakatakAhmvService } from "./contracts";

export type ManagedServiceDefinition = {
  code: TakatakAhmvService;
  owner: "takatak";
  detachable: true;
  customerFacing: false;
  description: string;
};

export const TAKATAK_AHMV_SERVICE_CATALOG: readonly ManagedServiceDefinition[] = [
  { code: "website", owner: "takatak", detachable: true, customerFacing: false, description: "Website operations and publishing control." },
  { code: "domain", owner: "takatak", detachable: true, customerFacing: false, description: "Domain and DNS lifecycle." },
  { code: "hosting", owner: "takatak", detachable: true, customerFacing: false, description: "Hosting, deployments and runtime operations." },
  { code: "seo", owner: "takatak", detachable: true, customerFacing: false, description: "SEO configuration, indexing and reporting." },
  { code: "social", owner: "takatak", detachable: true, customerFacing: false, description: "Social account publishing and synchronization." },
  { code: "local_listing", owner: "takatak", detachable: true, customerFacing: false, description: "Local business/listing management." },
  { code: "blog", owner: "takatak", detachable: true, customerFacing: false, description: "Editorial content orchestration." },
  { code: "reviews", owner: "takatak", detachable: true, customerFacing: false, description: "Review collection and response workflows." },
  { code: "lead_calls", owner: "takatak", detachable: true, customerFacing: false, description: "Lead-call workflow and attribution." },
  { code: "notifications", owner: "takatak", detachable: true, customerFacing: false, description: "Cross-channel notification orchestration." },
  { code: "sms", owner: "takatak", detachable: true, customerFacing: false, description: "Transactional and approved messaging service." },
  { code: "voice", owner: "takatak", detachable: true, customerFacing: false, description: "VOIP/voice control plane; provider implementation may change." },
  { code: "email", owner: "takatak", detachable: true, customerFacing: false, description: "Transactional and operational email." },
  { code: "calendar", owner: "takatak", detachable: true, customerFacing: false, description: "Calendar connector management." },
  { code: "analytics", owner: "takatak", detachable: true, customerFacing: false, description: "Operational analytics and value reporting." },
  { code: "automations", owner: "takatak", detachable: true, customerFacing: false, description: "Rules, jobs and cross-service automation." },
] as const;
