import { useState } from 'react'
import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { CatPaw } from '@/components/cat-icons'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Pencil, Wallet as WalletIcon } from 'lucide-react'
import type { Wallet } from '@/types'

const WALLET_COLORS = [
  '#6E473B', // Cocoa
  '#5A7A3A', // Olive
  '#A0522D', // Sienna
  '#A78D78', // Tan
  '#4A6A7A', // Slate teal
  '#7A4A2A', // Warm brown
  '#8A8A3A', // Golden olive
  '#6A3A5A', // Dusty mauve
]

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet, transactions, categories, addTransaction } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editWallet, setEditWallet] = useState<Wallet | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Wallet | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<Wallet['type']>('cash')
  const [color, setColor] = useState(WALLET_COLORS[0])
  const [balanceInput, setBalanceInput] = useState('')

  const resetForm = () => {
    setName('')
    setType('cash')
    setColor(WALLET_COLORS[0])
    setBalanceInput('')
    setEditWallet(null)
  }

  const openAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (wallet: Wallet) => {
    setEditWallet(wallet)
    setName(wallet.name)
    setType(wallet.type)
    setColor(wallet.color || WALLET_COLORS[0])
    setBalanceInput(wallet.balance.toString())
    setShowForm(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (editWallet) {
      updateWallet(editWallet.id, { name, type, color })
      const newBalance = parseFloat(balanceInput.replace(/[^0-9.-]/g, '')) || 0
      const diff = newBalance - editWallet.balance
      if (diff !== 0) {
        const txType = diff > 0 ? 'income' : 'expense'
        const adjustCat = categories.find(c => c.type === txType && c.name === 'Lainnya')
        addTransaction({
          type: txType,
          amount: Math.abs(diff),
          name: 'Penyesuaian Saldo',
          date: new Date().toISOString().split('T')[0],
          category: adjustCat?.id ?? (diff > 0 ? 'cat-other-income' : 'cat-other-expense'),
          description: `Penyesuaian saldo dompet ${name}`,
          walletId: editWallet.id,
        })
      }
    } else {
      addWallet({ name, type, balance: 0, color })
    }
    setShowForm(false)
    resetForm()
  }

  const handleDelete = (wallet: Wallet) => {
    const hasTransactions = transactions.some(t => t.walletId === wallet.id)
    if (hasTransactions) {
      toast.error('Tidak bisa hapus dompet yang masih memiliki transaksi')
      return
    }
    setDeleteTarget(wallet)
  }

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

  const getWalletStats = (walletId: string) => {
    const txs = transactions.filter(t => t.walletId === walletId)
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense }
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brown-950 dark:text-brown-100 flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-brown-400" />
          Dompet
        </h2>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Total */}
      <Card className="bg-linear-to-br from-brown-700 to-brown-950 text-white border-none">
        <CardContent className="p-5">
          <p className="text-brown-200 text-sm">Total Saldo</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-brown-200 text-xs mt-2">{wallets.length} dompet aktif</p>
        </CardContent>
      </Card>

      {/* Wallet list */}
      <div className="space-y-3">
        {wallets.map(wallet => (
          <Card key={wallet.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: wallet.color || '#6E473B' }}
                  >
                    {wallet.type === 'cash' ? '💵' : wallet.type === 'bank' ? '🏦' : wallet.type === 'e-wallet' ? '📱' : '💳'}
                  </div>
                  <div>
                    <p className="font-medium text-brown-950 dark:text-brown-100">{wallet.name}</p>
                    <Badge variant="outline">{wallet.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(wallet.balance)}
                  </p>
                  {/* Income/expense differentiation */}
                  {(() => {
                    const stats = getWalletStats(wallet.id)
                    if (stats.income === 0 && stats.expense === 0) return null
                    return (
                      <div className="flex gap-2 mt-1 justify-end">
                        {stats.income > 0 && (
                          <span className="text-[10px] text-green-600 font-medium">↑ {formatCurrency(stats.income)}</span>
                        )}
                        {stats.expense > 0 && (
                          <span className="text-[10px] text-red-500 font-medium">↓ {formatCurrency(stats.expense)}</span>
                        )}
                      </div>
                    )
                  })()}
                  <div className="flex gap-1 mt-1 place-content-end">
                    <button onClick={() => openEdit(wallet)} className="p-2.5 rounded-xl active:bg-brown-100 dark:active:bg-brown-800/40">
                      <Pencil className="h-4 w-4 text-brown-400" />
                    </button>
                    <button onClick={() => handleDelete(wallet)} className="p-2.5 rounded-xl active:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <CatPaw size={48} className="mx-auto text-brown-300 mb-3" />
          <p className="text-brown-400">Belum ada dompet</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        footer={
          <Button onClick={handleSave} className="w-full h-12" disabled={!name.trim()}>
            {editWallet ? 'Simpan Perubahan 🐾' : 'Tambah Dompet 🐾'}
          </Button>
        }
      >
        <DialogTitle>{editWallet ? 'Edit Dompet' : 'Tambah Dompet'} 🐱</DialogTitle>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-brown-700 mb-1 block">Nama Dompet</label>
            <Input
              placeholder="Contoh: BCA, GoPay, Cash"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          {editWallet && (
            <div>
              <label className="text-xs font-medium text-brown-700 mb-1 block">Saldo Dompet</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
              />
              {(() => {
                const newBal = parseFloat(balanceInput.replace(/[^0-9.-]/g, '')) || 0
                const diff = newBal - editWallet.balance
                if (diff === 0) return null
                return (
                  <p className={`text-xs mt-1 ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {diff > 0 ? '↑' : '↓'} Selisih {formatCurrency(Math.abs(diff))} — transaksi penyesuaian akan dibuat
                  </p>
                )
              })()}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-brown-700 mb-1 block">Tipe</label>
            <Select
              value={type}
              onChange={e => setType(e.target.value as Wallet['type'])}
              options={[
                { value: 'cash', label: '💵 Cash' },
                { value: 'bank', label: '🏦 Bank' },
                { value: 'e-wallet', label: '📱 E-Wallet' },
                { value: 'other', label: '💳 Lainnya' },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-brown-700 mb-2 block">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-brown-500 scale-110' : 'active:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Dompet"
        message={`Hapus dompet "${deleteTarget?.name}"?`}
        confirmLabel="Hapus"
        onConfirm={() => { if (deleteTarget) deleteWallet(deleteTarget.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
