export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  name: string
  date: string // ISO date string
  category: string
  description?: string
  walletId: string
  createdAt: string
}

export interface Wallet {
  id: string
  name: string
  type: 'cash' | 'bank' | 'e-wallet' | 'other'
  balance: number
  icon?: string
  color?: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon?: string
}

export interface AppSettings {
  monthStartDay: number // 1-31
  groqApiKey?: string
  currency: string
  autoBackup: boolean
  lastBackupDate?: string
}

export interface BackupData {
  id: string
  date: string
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  settings: AppSettings
  version: string
}

export interface MonthPeriod {
  start: Date
  end: Date
  label: string
}
