import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

type PhoneStatusPayload = {
  public?: unknown;
};

export function useAhmvPhoneStatus() {
  const [phonePublic, setPhonePublic] = useState<boolean>(SITE.phonePublic);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/ahmv/phone-status", {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as PhoneStatusPayload;
        setPhonePublic(payload.public === true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Fail closed. The static SITE flag remains the fallback.
      });

    return () => controller.abort();
  }, []);

  return {
    phonePublic,
    phoneDisplay: SITE.phoneDisplay,
    phoneE164: SITE.phoneE164,
  };
}
