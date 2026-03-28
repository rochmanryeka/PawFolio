import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 rounded-xl bg-brown-100 dark:bg-brown-800/40 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            active === tab.id
              ? "bg-cream dark:bg-brown-950 text-brown-700 dark:text-brown-300 shadow-sm"
              : "text-brown-400 hover:text-brown-700 dark:hover:text-brown-300"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
