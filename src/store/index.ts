import { create } from 'zustand'
import type { Transaction, Wallet, Category, AppSettings, BackupData } from '@/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEYS = {
  transactions: 'finflow_transactions',
  wallets: 'finflow_wallets',
  categories: 'finflow_categories',
  settings: 'finflow_settings',
  backups: 'finflow_backups',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch { return fallback }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

const defaultCategories: Category[] = [
  { id: 'cat-salary', name: 'Gaji', type: 'income', icon: '💰' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: '💻' },
  { id: 'cat-investment', name: 'Investasi', type: 'income', icon: '📈' },
  { id: 'cat-gift', name: 'Hadiah', type: 'income', icon: '🎁' },
  { id: 'cat-other-income', name: 'Lainnya', type: 'income', icon: '✨' },
  { id: 'cat-food', name: 'Makanan', type: 'expense', icon: '🍔' },
  { id: 'cat-transport', name: 'Transportasi', type: 'expense', icon: '🚗' },
  { id: 'cat-shopping', name: 'Belanja', type: 'expense', icon: '🛍️' },
  { id: 'cat-bills', name: 'Tagihan', type: 'expense', icon: '📱' },
  { id: 'cat-health', name: 'Kesehatan', type: 'expense', icon: '💊' },
  { id: 'cat-entertainment', name: 'Hiburan', type: 'expense', icon: '🎮' },
  { id: 'cat-education', name: 'Pendidikan', type: 'expense', icon: '📚' },
  { id: 'cat-other-expense', name: 'Lainnya', type: 'expense', icon: '📦' },
]

const defaultSettings: AppSettings = {
  monthStartDay: 1,
  currency: 'IDR',
  autoBackup: true,
  darkMode: false,
}

const defaultWallets: Wallet[] = [
  { id: 'wallet-cash', name: 'Cash', type: 'cash', balance: 0, color: '#22c55e' },
  { id: 'wallet-bank', name: 'Bank', type: 'bank', balance: 0, color: '#3b82f6' },
]

interface AppStore {
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  settings: AppSettings
  backups: BackupData[]

  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, tx: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Wallet actions
  addWallet: (wallet: Omit<Wallet, 'id'>) => void
  updateWallet: (id: string, wallet: Partial<Wallet>) => void
  deleteWallet: (id: string) => void

  // Category actions
  addCategory: (cat: Omit<Category, 'id'>) => void
  deleteCategory: (id: string) => void

  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void

  // Backup
  createBackup: () => BackupData
  restoreBackup: (backup: BackupData) => void
  deleteBackup: (id: string) => void

  // Recalculate wallet balances
  recalculateBalances: () => void
}

export const useStore = create<AppStore>((set, get) => ({
  transactions: loadFromStorage(STORAGE_KEYS.transactions, []),
  wallets: loadFromStorage(STORAGE_KEYS.wallets, defaultWallets),
  categories: loadFromStorage(STORAGE_KEYS.categories, defaultCategories),
  settings: loadFromStorage(STORAGE_KEYS.settings, defaultSettings),
  backups: loadFromStorage(STORAGE_KEYS.backups, []),

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const transactions = [newTx, ...state.transactions]
      saveToStorage(STORAGE_KEYS.transactions, transactions)
      
      // Update wallet balance
      const wallets = state.wallets.map(w => {
        if (w.id === tx.walletId) {
          return {
            ...w,
            balance: tx.type === 'income' 
              ? w.balance + tx.amount 
              : w.balance - tx.amount
          }
        }
        return w
      })
      saveToStorage(STORAGE_KEYS.wallets, wallets)
      
      return { transactions, wallets }
    })
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const transactions = state.transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
      saveToStorage(STORAGE_KEYS.transactions, transactions)
      return { transactions }
    })
    get().recalculateBalances()
  },

  deleteTransaction: (id) => {
    set((state) => {
      const tx = state.transactions.find(t => t.id === id)
      const transactions = state.transactions.filter(t => t.id !== id)
      saveToStorage(STORAGE_KEYS.transactions, transactions)

      if (tx) {
        const wallets = state.wallets.map(w => {
          if (w.id === tx.walletId) {
            return {
              ...w,
              balance: tx.type === 'income'
                ? w.balance - tx.amount
                : w.balance + tx.amount
            }
          }
          return w
        })
        saveToStorage(STORAGE_KEYS.wallets, wallets)
        return { transactions, wallets }
      }
      return { transactions }
    })
  },

  addWallet: (wallet) => {
    const newWallet: Wallet = { ...wallet, id: generateId() }
    set((state) => {
      const wallets = [...state.wallets, newWallet]
      saveToStorage(STORAGE_KEYS.wallets, wallets)
      return { wallets }
    })
  },

  updateWallet: (id, updates) => {
    set((state) => {
      const wallets = state.wallets.map(w =>
        w.id === id ? { ...w, ...updates } : w
      )
      saveToStorage(STORAGE_KEYS.wallets, wallets)
      return { wallets }
    })
  },

  deleteWallet: (id) => {
    set((state) => {
      const wallets = state.wallets.filter(w => w.id !== id)
      saveToStorage(STORAGE_KEYS.wallets, wallets)
      return { wallets }
    })
  },

  addCategory: (cat) => {
    const newCat: Category = { ...cat, id: generateId() }
    set((state) => {
      const categories = [...state.categories, newCat]
      saveToStorage(STORAGE_KEYS.categories, categories)
      return { categories }
    })
  },

  deleteCategory: (id) => {
    set((state) => {
      const categories = state.categories.filter(c => c.id !== id)
      saveToStorage(STORAGE_KEYS.categories, categories)
      return { categories }
    })
  },

  updateSettings: (updates) => {
    set((state) => {
      const settings = { ...state.settings, ...updates }
      saveToStorage(STORAGE_KEYS.settings, settings)
      return { settings }
    })
  },

  createBackup: () => {
    const state = get()
    const backup: BackupData = {
      id: generateId(),
      date: new Date().toISOString(),
      transactions: state.transactions,
      wallets: state.wallets,
      categories: state.categories,
      settings: state.settings,
      version: '1.0.0',
    }
    const backups = [backup, ...state.backups].slice(0, 30) // Keep max 30 backups
    saveToStorage(STORAGE_KEYS.backups, backups)
    set({ backups })
    return backup
  },

  restoreBackup: (backup) => {
    set({
      transactions: backup.transactions,
      wallets: backup.wallets,
      categories: backup.categories,
      settings: backup.settings,
    })
    saveToStorage(STORAGE_KEYS.transactions, backup.transactions)
    saveToStorage(STORAGE_KEYS.wallets, backup.wallets)
    saveToStorage(STORAGE_KEYS.categories, backup.categories)
    saveToStorage(STORAGE_KEYS.settings, backup.settings)
  },

  deleteBackup: (id) => {
    set((state) => {
      const backups = state.backups.filter(b => b.id !== id)
      saveToStorage(STORAGE_KEYS.backups, backups)
      return { backups }
    })
  },

  recalculateBalances: () => {
    set((state) => {
      const balanceMap: Record<string, number> = {}
      state.wallets.forEach(w => { balanceMap[w.id] = 0 })
      
      state.transactions.forEach(tx => {
        if (balanceMap[tx.walletId] !== undefined) {
          if (tx.type === 'income') {
            balanceMap[tx.walletId] += tx.amount
          } else {
            balanceMap[tx.walletId] -= tx.amount
          }
        }
      })

      const wallets = state.wallets.map(w => ({
        ...w,
        balance: balanceMap[w.id] ?? w.balance
      }))
      saveToStorage(STORAGE_KEYS.wallets, wallets)
      return { wallets }
    })
  },
}))
