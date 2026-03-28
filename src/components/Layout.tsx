import { useState, useEffect } from 'react'
import { PawFolioLogoFull } from '@/components/pawfolio-logo'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Wallets from '@/pages/Wallets'
import Backup from '@/pages/Backup'
import Settings from '@/pages/Settings'
import {
  LayoutDashboard, Receipt, Wallet, HardDrive, Settings as SettingsIcon, Sun, Moon
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

  // Apply dark mode class to <html>
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

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
    <div className="min-h-screen bg-gradient-to-b from-brown-100 via-brown-50 to-cream dark:from-[#1a0e07] dark:via-brown-950 dark:to-[#291C0E] transition-colors duration-300">
      {/* Header — respects status bar via safe-area-inset-top */}
      <header
        className="sticky top-0 z-30 bg-cream/90 dark:bg-[#1a0e07]/92 backdrop-blur-md border-b border-brown-200 dark:border-[#4a2e1e]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <PawFolioLogoFull size={32} />
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-brown-100 dark:bg-brown-800/40 text-brown-500 dark:text-brown-300 hover:bg-brown-200 dark:hover:bg-brown-700/50 transition-colors active:scale-95"
            aria-label="Toggle dark mode"
          >
            {settings.darkMode
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {renderPage()}
      </main>

      {/* Spacer so content clears fixed bottom nav */}
      <div style={{ height: `calc(4rem + env(safe-area-inset-bottom, 0px))` }} />

      {/* Bottom Navigation — respects Android nav bar via safe-area-inset-bottom */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-cream/92 dark:bg-[#1a0e07]/96 backdrop-blur-md border-t border-brown-200 dark:border-[#4a2e1e]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all duration-200 relative",
                  isActive
                    ? "text-brown-700 dark:text-brown-400"
                    : "text-brown-300 dark:text-brown-600 hover:text-brown-500 dark:hover:text-brown-400"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 bg-linear-to-r from-brown-700 to-brown-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
