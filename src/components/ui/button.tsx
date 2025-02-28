
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 button-glow",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md border border-primary/10 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md border border-destructive/10 font-medium",
        outline:
          "border border-input bg-background hover:bg-accent/15 hover:border-accent hover:text-accent-foreground shadow-sm font-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md border border-secondary/20 font-medium",
        ghost: "hover:bg-accent/15 hover:text-accent-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium p-0 h-auto",
        soft: "bg-primary/15 text-primary hover:bg-primary/25 shadow-sm border border-primary/10 font-medium",
        gold: "bg-amber-500 text-white hover:bg-amber-600 shadow-md border border-amber-400/10 font-semibold",
        premium: "bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500 shadow-md border border-amber-400/10 font-semibold",
        admin: "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-md border border-indigo-500/10 font-semibold",
        manager: "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md border border-teal-500/10 font-semibold",
        seller: "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md border border-blue-500/10 font-semibold",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
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
