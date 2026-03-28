import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/toast'
import { CatPaw, CatSleep } from '@/components/cat-icons'
import { formatCurrency } from '@/lib/utils'
import { getMonthPeriod, getNextPeriod, getPrevPeriod, isInPeriod, formatDate } from '@/lib/date-utils'
import { parseTransactionWithAI } from '@/lib/groq'
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2, Pencil, Search } from 'lucide-react'
import type { Transaction, TransactionType } from '@/types'

export default function Transactions() {
  const { transactions, wallets, categories, settings, addTransaction, deleteTransaction } = useStore()
  const [period, setPeriod] = useState(() => getMonthPeriod(new Date(), settings.monthStartDay))
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  // Form state
  const [formType, setFormType] = useState<TransactionType>('expense')
  const [formAmount, setFormAmount] = useState('')
  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formCategory, setFormCategory] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formWallet, setFormWallet] = useState(wallets[0]?.id || '')

  const periodTransactions = useMemo(() => {
    let filtered = transactions.filter(t => isInPeriod(t.date, period))
    if (filter !== 'all') filtered = filtered.filter(t => t.type === filter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, period, filter, searchQuery])

  const filteredCategories = categories.filter(c => c.type === formType)

  const resetForm = () => {
    setFormType('expense')
    setFormAmount('')
    setFormName('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormCategory('')
    setFormDescription('')
    setFormWallet(wallets[0]?.id || '')
    setAiInput('')
    setAiMode(false)
  }

  const handleSubmit = () => {
    if (!formAmount || !formName || !formWallet) return

    addTransaction({
      type: formType,
      amount: parseFloat(formAmount),
      name: formName,
      date: formDate,
      category: formCategory || filteredCategories[0]?.name || 'Lainnya',
      description: formDescription || undefined,
      walletId: formWallet,
    })
    resetForm()
    setShowForm(false)
  }

  const handleAIParse = async () => {
    if (!aiInput.trim() || !settings.groqApiKey) return
    setAiLoading(true)
    try {
      const result = await parseTransactionWithAI(aiInput, settings.groqApiKey, categories)
      if (result) {
        setFormType(result.type)
        setFormAmount(result.amount.toString())
        setFormName(result.name)
        setFormDate(result.date)
        setFormCategory(result.category)
        setFormDescription(result.description || '')
        setAiMode(false)
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleDelete = (tx: Transaction) => {
    setDeleteTarget(tx)
  }

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    periodTransactions.forEach(tx => {
      const day = tx.date.split('T')[0]
      if (!groups[day]) groups[day] = []
      groups[day].push(tx)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [periodTransactions])

  return (
    <div className="space-y-4 pb-20">
      {/* Period navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setPeriod(p => getPrevPeriod(p, settings.monthStartDay))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-brown-950 dark:text-brown-100 capitalize">{period.label}</h2>
        <Button variant="ghost" size="icon" onClick={() => setPeriod(p => getNextPeriod(p, settings.monthStartDay))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'Semua' },
          { id: 'income', label: 'Masuk' },
          { id: 'expense', label: 'Keluar' },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as typeof filter)}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown-300" />
        <Input
          placeholder="Cari transaksi... 🐱"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Transaction list grouped by date */}
      {groupedByDate.length === 0 ? (
        <div className="text-center py-12">
          <CatSleep size={64} className="mx-auto text-brown-300 mb-3" />
          <p className="text-brown-400">Belum ada transaksi</p>
          <p className="text-xs text-brown-300 mt-1">Ketuk + untuk menambah</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-brown-400 mb-2 px-1">{formatDate(date)}</p>
              <div className="space-y-2">
                {txs.map(tx => {
                  const wallet = wallets.find(w => w.id === tx.walletId)
                  return (
                    <Card key={tx.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                              tx.type === 'income'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {categories.find(c => c.name === tx.category)?.icon || (tx.type === 'income' ? '💰' : '💸')}
                            </div>
                            <div className="min-w-0">
                            <p className="text-sm font-medium text-brown-950 dark:text-brown-100 truncate">{tx.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-brown-400">{tx.category}</span>
                              {wallet && (
                                <>
                                  <span className="text-xs text-brown-200">·</span>
                                  <span className="text-xs text-brown-400">{wallet.name}</span>
                                </>
                              )}
                            </div>
                            {tx.description && (
                              <p className="text-xs text-brown-300 truncate">{tx.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-semibold whitespace-nowrap ${
                              tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                            <button
                              onClick={() => handleDelete(tx)}
                              className="p-2.5 rounded-xl active:bg-red-50 transition-all -mr-1.5"
                            >
                              <Trash2 className="h-4 w-4 text-red-300" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { resetForm(); setShowForm(true) }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-linear-to-br from-brown-700 to-brown-400 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 active:shadow-sm transition-all z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Transaction Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        footer={
          aiMode ? (
            <Button onClick={handleAIParse} disabled={aiLoading || !aiInput.trim()} className="w-full h-12 gap-2">
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Memproses...' : 'Parse dengan AI 🐱'}
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full h-12" disabled={!formAmount || !formName}>
              Simpan Transaksi 🐾
            </Button>
          )
        }
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <CatPaw size={24} className="text-brown-400" />
            Tambah Transaksi
          </div>
        </DialogTitle>

        {/* AI mode toggle */}
        {settings.groqApiKey && (
          <div className="mb-4">
            <Button
              variant={aiMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAiMode(!aiMode)}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              {aiMode ? 'Mode AI Aktif' : 'Input via AI'}
            </Button>
          </div>
        )}

        {aiMode ? (
          <div className="space-y-3">
            <Textarea
              placeholder='Contoh: "Beli kopi 25rb di starbucks" atau "Gajian 5 juta"'
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              rows={3}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Type tabs */}
            <Tabs
              tabs={[
                { id: 'expense', label: '💸 Pengeluaran' },
                { id: 'income', label: '💰 Pemasukan' },
              ]}
              active={formType}
              onChange={(id) => setFormType(id as TransactionType)}
            />

            <div>
              <label className="text-xs font-medium text-brown-700 mb-1 block">Nama</label>
              <Input
                placeholder="Nama transaksi"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 mb-1 block">Nominal</label>
              <Input
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-brown-700 mb-1 block">Tanggal</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brown-700 mb-1 block">Kategori</label>
                <Select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  options={filteredCategories.map(c => ({
                    value: c.name,
                    label: `${c.icon || ''} ${c.name}`,
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 mb-1 block">Dompet</label>
              <Select
                value={formWallet}
                onChange={e => setFormWallet(e.target.value)}
                options={wallets.map(w => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 mb-1 block">Keterangan (opsional)</label>
              <Input
                placeholder="Detail tambahan..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Transaksi"
        message={`Hapus "${deleteTarget?.name}"?`}
        confirmLabel="Hapus"
        onConfirm={() => { if (deleteTarget) deleteTransaction(deleteTarget.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
