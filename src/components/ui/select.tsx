import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border-2 border-brown-200 dark:border-brown-700 bg-cream dark:bg-brown-950 text-brown-950 dark:text-brown-100 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-brown-500 focus-visible:ring-1 focus-visible:ring-brown-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
)
Select.displayName = "Select"

export { Select }
