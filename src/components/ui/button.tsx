import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default:     "bg-brown-700 text-brown-50 hover:bg-brown-950 dark:bg-brown-400 dark:text-brown-950 dark:hover:bg-brown-300 shadow-sm",
      destructive: "bg-red-700 text-white hover:bg-red-800",
      outline:     "border-2 border-brown-300 dark:border-brown-700 bg-transparent hover:bg-brown-100 dark:hover:bg-brown-800/40 text-brown-700 dark:text-brown-300",
      secondary:   "bg-brown-100 dark:bg-brown-800/40 text-brown-700 dark:text-brown-300 hover:bg-brown-200 dark:hover:bg-brown-800/60",
      ghost:       "hover:bg-brown-100 dark:hover:bg-brown-800/40 text-brown-700 dark:text-brown-300",
      link:        "text-brown-700 dark:text-brown-400 underline-offset-4 hover:underline",
    }
    const sizes = {
      default: "h-11 px-4 py-2",
      sm:      "h-9 px-3 text-sm",
      lg:      "h-13 px-6 text-lg",
      icon:    "h-11 w-11",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-400 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
