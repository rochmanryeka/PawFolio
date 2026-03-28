import { useState, useEffect } from 'react'
import { CatFace, CatPaw } from '@/components/cat-icons'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Wallets from '@/pages/Wallets'
import Backup from '@/pages/Backup'
import Settings from '@/pages/Settings'
import {
  LayoutDashboard, Receipt, Wallet, HardDrive, Settings as SettingsIcon
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: Receipt },
  { id: 'wallets', label: 'Dompet', icon: Wallet },
  { id: 'backup', label: 'Backup', icon: HardDrive },
  { id: 'settings', label: 'Setting', icon: SettingsIcon },
]

export default function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { settings, createBackup, updateSettings } = useStore()

  // Auto daily backup
  useEffect(() => {
    if (!settings.autoBackup) return
    const lastBackup = settings.lastBackupDate ? new Date(settings.lastBackupDate) : null
    const now = new Date()
    const shouldBackup = !lastBackup || 
      (now.getTime() - lastBackup.getTime() > 24 * 60 * 60 * 1000)
    
    if (shouldBackup) {
      createBackup()
      updateSettings({ lastBackupDate: now.toISOString() })
    }
  }, [settings.autoBackup, settings.lastBackupDate, createBackup, updateSettings])

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'transactions': return <Transactions />
      case 'wallets': return <Wallets />
      case 'backup': return <Backup />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CatPaw size={28} className="text-purple-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              FinFlow
            </h1>
          </div>
          <CatFace size={28} className="text-purple-400" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-purple-100">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all duration-200",
                  isActive ? "text-purple-600" : "text-purple-300 hover:text-purple-400"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
