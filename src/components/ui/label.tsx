"use client"

import * as React from "react"
import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className="block text-[16px] font-medium leading-5 text-foreground"
      {...props}
    />
  )
}

export { Label }
