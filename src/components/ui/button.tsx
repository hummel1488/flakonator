
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 button-glow",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button border border-primary/20 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-button border border-destructive/20 font-medium",
        outline:
          "border-2 border-input bg-background hover:bg-accent/50 hover:text-accent-foreground shadow-sm font-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-button border-2 border-secondary/30 font-medium",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium",
        soft: "bg-primary/20 text-primary hover:bg-primary/30 shadow-sm border-2 border-primary/20 font-medium",
        gold: "bg-brand-gold text-white hover:bg-brand-dark-gold shadow-button border-2 border-brand-gold/30 font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
