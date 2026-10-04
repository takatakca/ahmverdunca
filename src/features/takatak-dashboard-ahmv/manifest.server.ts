import { TAKATAK_AHMV_MANIFEST } from "./contracts";
import { TAKATAK_AHMV_SERVICE_CATALOG } from "./service-catalog";

export function getTakatakAhmvBackendManifest() {
  return {
    ...TAKATAK_AHMV_MANIFEST,
    serviceCatalog: TAKATAK_AHMV_SERVICE_CATALOG,
    ui: {
      mounted: false,
      autoVisible: false,
    },
    integration: {
      mode: "server_to_server",
      providerSecretsRemainServerSide: true,
      destructiveActionsRequireExplicitRequest: true,
    },
  } as const;
}
