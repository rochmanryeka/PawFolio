import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'income' | 'expense' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default:  "bg-brown-100 dark:bg-brown-800/60 text-brown-700 dark:text-brown-200",
    income:   "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
    expense:  "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
    outline:  "border border-brown-300 dark:border-brown-600 text-brown-600 dark:text-brown-300",
  }
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
