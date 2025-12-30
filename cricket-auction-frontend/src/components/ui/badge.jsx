import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#E50914] text-white",
        secondary:
          "bg-[#333] text-gray-300",
        destructive:
          "bg-[#E50914] text-white animate-pulse",
        outline: "text-white border border-[#404040]",
        success:
          "bg-green-600 text-white",
        warning:
          "bg-orange-500 text-white",
        catA:
          "bg-gradient-to-r from-white to-gray-200 text-[#141414] font-bold",
        catB:
          "bg-gradient-to-r from-gray-400 to-gray-500 text-[#141414] font-bold",
        catC:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold",
        catD:
          "bg-gradient-to-r from-[#E50914] to-[#B20710] text-white font-bold",
        live:
          "bg-[#E50914] text-white animate-pulse",
        sold:
          "bg-green-600 text-white",
        unsold:
          "bg-[#333] text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
