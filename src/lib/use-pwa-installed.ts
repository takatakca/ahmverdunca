import { useEffect, useState } from "react";

export function usePwaInstalled() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
    const refresh = () => setInstalled(displayMode.matches || standaloneNavigator.standalone === true);
    const onInstalled = () => setInstalled(true);
    refresh();
    displayMode.addEventListener("change", refresh);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      displayMode.removeEventListener("change", refresh);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  return installed;
}
