import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display font-semibold uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 tap-target",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-navy-deep",
        sport: "bg-sport text-sport-foreground hover:brightness-95 shadow-[0_8px_24px_-10px_var(--color-sport)]",
        outline: "border border-input bg-background text-foreground hover:bg-secondary",
        "outline-light": "border border-navy-foreground/40 text-navy-foreground hover:bg-navy-foreground/10",
        ghost: "text-foreground hover:bg-secondary",
        link: "text-sport underline-offset-4 hover:underline normal-case tracking-normal font-sans",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
