import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { buttonVariants } from "./button-variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: string | React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, Readonly<ButtonProps>>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Basic button without tooltip
    const button = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
    
    // If no tooltip, return the basic button
    if (!tooltip) {
      return button
    }
    
    // With tooltip
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
