import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'income' | 'expense' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-purple-100 text-purple-800",
    income: "bg-green-100 text-green-800",
    expense: "bg-red-100 text-red-800",
    outline: "border border-purple-200 text-purple-600",
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
