import {
  TAKATAK_AHMV_ACTIONS,
  TAKATAK_AHMV_SERVICES,
  type TakatakAhmvAction,
  type TakatakAhmvService,
} from "./contracts";

export const TAKATAK_AHMV_ROLES = [
  "owner",
  "admin",
  "manager",
  "operator",
  "viewer",
] as const;

export type TakatakAhmvRole = (typeof TAKATAK_AHMV_ROLES)[number];

export type TakatakAhmvPrincipal = {
  actorId: string;
  organizationId: string;
  role: TakatakAhmvRole;
  enabledServices: readonly TakatakAhmvService[];
};

const READ: readonly TakatakAhmvAction[] = ["read"];
const EDIT: readonly TakatakAhmvAction[] = [
  "read",
  "save_draft",
  "publish",
  "archive",
  "restore",
];
const OPERATE: readonly TakatakAhmvAction[] = [
  "read",
  "save_draft",
  "execute",
];

const ROLE_ACTIONS: Record<TakatakAhmvRole, readonly TakatakAhmvAction[]> = {
  owner: TAKATAK_AHMV_ACTIONS,
  admin: [...EDIT, "execute"],
  manager: EDIT,
  operator: OPERATE,
  viewer: READ,
};

export function isKnownTakatakAhmvRole(value: string): value is TakatakAhmvRole {
  return TAKATAK_AHMV_ROLES.includes(value as TakatakAhmvRole);
}

export function isServiceEnabledForPrincipal(
  principal: TakatakAhmvPrincipal,
  service: TakatakAhmvService,
) {
  return principal.enabledServices.includes(service);
}

export function canPrincipalPerform(
  principal: TakatakAhmvPrincipal,
  service: TakatakAhmvService,
  action: TakatakAhmvAction,
) {
  return (
    TAKATAK_AHMV_SERVICES.includes(service) &&
    isServiceEnabledForPrincipal(principal, service) &&
    ROLE_ACTIONS[principal.role].includes(action)
  );
}

export function assertPrincipalCanPerform(
  principal: TakatakAhmvPrincipal,
  service: TakatakAhmvService,
  action: TakatakAhmvAction,
) {
  if (!canPrincipalPerform(principal, service, action)) {
    throw new Error("takatak_ahmv_forbidden");
  }
}
