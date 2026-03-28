import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 rounded-xl bg-purple-50 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            active === tab.id
              ? "bg-white text-purple-700 shadow-sm"
              : "text-purple-400 hover:text-purple-600"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
