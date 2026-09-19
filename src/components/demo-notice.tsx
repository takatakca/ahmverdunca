import { AlertTriangle, Info, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Localized } from "@/lib/i18n";

type Kind = "demo" | "connect" | "info";

const icons = { demo: AlertTriangle, connect: PlugZap, info: Info };

/**
 * Explicit label for anything not real yet: demo data, features to connect later,
 * information to obtain from the client. Always visible, never hidden.
 */
export function DemoNotice({
  kind = "demo",
  title,
  children,
  className,
}: {
  kind?: Kind;
  title?: Localized | string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { t, l } = useI18n();
  const Icon = icons[kind];
  const defaultTitle = kind === "demo" ? t("common.demoData") : kind === "connect" ? t("common.toConnect") : t("common.toValidate");
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-lg border border-demo/40 bg-demo-soft px-4 py-3 text-sm text-demo-foreground",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-wider">{title ? l(title) : defaultTitle}</p>
        {children && <div className="mt-0.5 leading-snug">{children}</div>}
      </div>
    </div>
  );
}
