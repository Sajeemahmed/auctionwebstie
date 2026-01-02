import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 btn-shine",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/40 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-border bg-transparent text-foreground shadow-sm hover:bg-primary/15 hover:border-primary hover:text-foreground hover:shadow-md hover:shadow-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-lg shadow-success/30 hover:bg-success/90 hover:shadow-xl hover:shadow-success/40 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        warning:
          "bg-warning text-warning-foreground shadow-lg shadow-warning/30 hover:bg-warning/90 hover:shadow-xl hover:shadow-warning/40 hover:scale-[1.02] active:scale-[0.98]",
        premium:
          "bg-gradient-to-r from-accent to-yellow-600 text-accent-foreground shadow-lg shadow-gold hover:shadow-xl hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 font-heading tracking-wider btn-shine",
        glow:
          "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg animate-glow-pulse active:scale-[0.98] pulse-slow",
        bid:
          "bg-gradient-to-r from-success to-emerald-600 text-success-foreground shadow-lg shadow-success/40 hover:shadow-2xl hover:shadow-success/50 hover:scale-110 active:scale-95 font-heading tracking-wider text-lg btn-shine",
        red:
          "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-lg shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 btn-shine",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
