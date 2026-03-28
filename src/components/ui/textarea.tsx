import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-xl border-2 border-brown-200 dark:border-brown-700 bg-cream dark:bg-brown-950 text-brown-950 dark:text-brown-100 px-3 py-2 text-sm transition-colors placeholder:text-brown-300 dark:placeholder:text-brown-500 focus-visible:outline-none focus-visible:border-brown-500 focus-visible:ring-1 focus-visible:ring-brown-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
