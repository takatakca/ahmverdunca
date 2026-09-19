import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        sport: "bg-sport text-sport-foreground",
        outline: "border border-border text-foreground",
        muted: "bg-muted text-muted-foreground",
        demo: "bg-demo-soft text-demo-foreground border border-demo/40",
        confirmed: "bg-status-confirmed-soft text-status-confirmed",
        modified: "bg-status-modified-soft text-status-modified",
        cancelled: "bg-status-cancelled-soft text-status-cancelled",
        pending: "bg-status-pending-soft text-status-pending",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
