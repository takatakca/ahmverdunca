import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function ShareButton({
  title,
  text,
  variant = "outline",
}: {
  title: string;
  text?: string;
  variant?: "outline" | "outline-light";
}) {
  const { lang } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
  };

  return (
    <Button type="button" variant={variant} onClick={() => void share()}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied
        ? (lang === "fr" ? "Lien copié" : "Link copied")
        : (lang === "fr" ? "Partager" : "Share")}
    </Button>
  );
}
