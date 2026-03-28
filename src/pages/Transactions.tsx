import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs } from '@/components/ui/tabs'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/components/ui/toast'
import { CatPaw, CatSleep } from '@/components/cat-icons'
import { formatCurrency } from '@/lib/utils'
import { getMonthPeriod, getNextPeriod, getPrevPeriod, isInPeriod, formatDate } from '@/lib/date-utils'
import { parseTransactionWithAI } from '@/lib/groq'
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2, Pencil, Search, CalendarDays, List } from 'lucide-react'
import type { Transaction, TransactionType } from '@/types'

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`
  return n.toString()
}

export default function Transactions() {
  const { transactions, wallets, categories, settings, addTransaction, updateTransaction, deleteTransaction } = useStore()
  const [period, setPeriod] = useState(() => getMonthPeriod(new Date(), settings.monthStartDay))
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
    setEditTarget(null)
  }

  const openEdit = (tx: Transaction) => {
    setEditTarget(tx)
    setFormType(tx.type)
    setFormAmount(tx.amount.toString())
    setFormName(tx.name)
    setFormDate(tx.date.split('T')[0])
    setFormCategory(tx.category)
    setFormDescription(tx.description || '')
    setFormWallet(tx.walletId)
    setAiMode(false)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!formAmount || !formName || !formWallet) return
    const txData = {
      type: formType,
      amount: parseFloat(formAmount),
      name: formName,
      date: formDate,
      category: formCategory || filteredCategories[0]?.name || 'Lainnya',
      description: formDescription || undefined,
      walletId: formWallet,
    }
    if (editTarget) {
      updateTransaction(editTarget.id, txData)
      toast.success('Transaksi diperbarui! 🐾')
    } else {
      addTransaction(txData)
    }
    resetForm()
    setShowForm(false)
  }

  const handleAIParse = async () => {
    if (!aiInput.trim() || !settings.groqApiKey) return
    setAiLoading(true)
    try {
      const result = await parseTransactionWithAI(aiInput, settings.groqApiKey, categories)
      if (result) {
        // Validate category strictly against available categories from settings
        const exactMatch = categories.find(
          c => c.name.toLowerCase() === result.category.toLowerCase() && c.type === result.type
        )
        const partialMatch = categories.find(
          c => c.name.toLowerCase().includes(result.category.toLowerCase()) && c.type === result.type
        )
        const fallback = categories.find(c => c.type === result.type)
        const validCat = exactMatch || partialMatch || fallback

        setFormType(result.type)
        setFormAmount(result.amount.toString())
        setFormName(result.name)
        setFormDate(result.date)
        setFormCategory(validCat?.name || '')
        setFormDescription(result.description || '')
        setAiMode(false)
        toast.success('Berhasil! Cek dan simpan 🐱')
      } else {
        toast.error('Gagal parse, coba lagi')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleDelete = (tx: Transaction) => setDeleteTarget(tx)

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    periodTransactions.forEach(tx => {
      const day = tx.date.split('T')[0]
      if (!groups[day]) groups[day] = []
      groups[day].push(tx)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [periodTransactions])

  // Calendar computation — uses all transactions in period (ignores filter/search)
  const calendarData = useMemo(() => {
    const year = period.start.getFullYear()
    const month = period.start.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstWeekday = new Date(year, month, 1).getDay()
    const allPeriodTx = transactions.filter(t => isInPeriod(t.date, period))
    const dayTotals: Record<string, { income: number; expense: number }> = {}
    allPeriodTx.forEach(tx => {
      const day = tx.date.split('T')[0]
      if (!dayTotals[day]) dayTotals[day] = { income: 0, expense: 0 }
      if (tx.type === 'income') dayTotals[day].income += tx.amount
      else dayTotals[day].expense += tx.amount
    })
    const totalIncome = allPeriodTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = allPeriodTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { year, month, daysInMonth, firstWeekday, dayTotals, totalIncome, totalExpense }
  }, [transactions, period])

  const today = new Date().toISOString().split('T')[0]

  const selectedDayTxs = useMemo(() => {
    if (!selectedDate) return []
    return transactions
      .filter(t => t.date.startsWith(selectedDate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [transactions, selectedDate])

  return (
    <div className="space-y-4 pb-4">
      {/* Period navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => { setPeriod(p => getPrevPeriod(p, settings.monthStartDay)); setSelectedDate(null) }}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-brown-950 dark:text-brown-100 capitalize">{period.label}</h2>
        <Button variant="ghost" size="icon" onClick={() => { setPeriod(p => getNextPeriod(p, settings.monthStartDay)); setSelectedDate(null) }}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-1 p-1 bg-brown-100 dark:bg-brown-900/40 rounded-xl">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'list'
              ? 'bg-white dark:bg-brown-800 text-brown-950 dark:text-brown-100 shadow-sm'
              : 'text-brown-400'
          }`}
        >
          <List className="h-4 w-4" />
          Daftar
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'calendar'
              ? 'bg-white dark:bg-brown-800 text-brown-950 dark:text-brown-100 shadow-sm'
              : 'text-brown-400'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Kalender
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
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

          {groupedByDate.length === 0 ? (
            <div className="text-center py-12">
              <CatSleep size={64} className="mx-auto text-brown-300 mb-3" />
              <p className="text-brown-400">Belum ada transaksi</p>
              <p className="text-xs text-brown-300 mt-1">Ketuk + untuk menambah</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDate.map(([date, txs]) => {
                const dailyIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                const dailyExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                return (
                  <div key={date}>
                    {/* Date header with daily totals */}
                    <div className="flex items-center justify-between px-1 mb-2">
                      <p className="text-xs font-semibold text-brown-400">{formatDate(date)}</p>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        {dailyIncome > 0 && <span className="text-green-600">+{formatCompact(dailyIncome)}</span>}
                        {dailyExpense > 0 && <span className="text-red-500">−{formatCompact(dailyExpense)}</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {txs.map(tx => {
                        const wallet = wallets.find(w => w.id === tx.walletId)
                        return (
                          <Card key={tx.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                  tx.type === 'income'
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : 'bg-red-50 dark:bg-red-900/20'
                                }`}>
                                  {categories.find(c => c.name === tx.category)?.icon || (tx.type === 'income' ? '💰' : '💸')}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-brown-950 dark:text-brown-100 truncate">{tx.name}</p>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                      tx.type === 'income'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    }`}>{tx.category}</span>
                                    {wallet && <span className="text-xs text-brown-300">{wallet.name}</span>}
                                  </div>
                                  {tx.description && (
                                    <p className="text-xs text-brown-300 truncate mt-0.5">{tx.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <span className={`text-sm font-bold whitespace-nowrap ${
                                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                                  </span>
                                  <button onClick={() => openEdit(tx)} className="p-2.5 rounded-xl active:bg-brown-50 dark:active:bg-brown-800/40">
                                    <Pencil className="h-4 w-4 text-brown-300" />
                                  </button>
                                  <button onClick={() => handleDelete(tx)} className="p-2.5 rounded-xl active:bg-red-50 -mr-1.5">
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
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* ── Calendar view ── */
        <div className="space-y-3">
          {/* Period summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Masuk</p>
              <p className="text-xs font-bold text-green-700 dark:text-green-300 mt-1 leading-tight">
                {formatCurrency(calendarData.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide">Keluar</p>
              <p className="text-xs font-bold text-red-600 dark:text-red-300 mt-1 leading-tight">
                {formatCurrency(calendarData.totalExpense)}
              </p>
            </div>
            <div className={`rounded-xl p-3 text-center ${
              calendarData.totalIncome - calendarData.totalExpense >= 0
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className="text-[10px] font-semibold text-brown-500 uppercase tracking-wide">Total</p>
              <p className={`text-xs font-bold mt-1 leading-tight ${
                calendarData.totalIncome - calendarData.totalExpense >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-600 dark:text-red-300'
              }`}>
                {formatCurrency(calendarData.totalIncome - calendarData.totalExpense)}
              </p>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="rounded-xl border border-brown-200 dark:border-brown-800 overflow-hidden">
            <div className="grid grid-cols-7 bg-brown-100 dark:bg-brown-900/60">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <div key={d} className={`text-center py-2.5 text-[11px] font-bold ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-brown-600 dark:text-brown-300' : 'text-brown-500'
                }`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: calendarData.firstWeekday }).map((_, i) => (
                <div key={`pad-${i}`} className="h-15.5 border-b border-r border-brown-100 dark:border-brown-800/40 bg-brown-50/40 dark:bg-brown-950/40" />
              ))}
              {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const dateStr = `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                const totals = calendarData.dayTotals[dateStr]
                const isToday = dateStr === today
                const isSelected = dateStr === selectedDate

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-15.5 p-1 flex flex-col border-b border-r border-brown-100 dark:border-brown-800/40 transition-all text-left ${
                      isSelected
                        ? 'bg-brown-100 dark:bg-brown-800/60'
                        : totals
                          ? 'active:bg-brown-50 dark:active:bg-brown-900/40'
                          : ''
                    }`}
                  >
                    <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${
                      isToday
                        ? 'bg-brown-700 text-white'
                        : 'text-brown-500 dark:text-brown-400'
                    }`}>{dayNum}</span>
                    {totals?.expense > 0 && (
                      <span className="text-[9px] leading-tight font-medium text-red-500 mt-0.5">
                        {formatCompact(totals.expense)}
                      </span>
                    )}
                    {totals?.income > 0 && (
                      <span className="text-[9px] leading-tight font-medium text-green-600">
                        +{formatCompact(totals.income)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day transactions */}
          {selectedDate && (
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-brown-500">{formatDate(selectedDate)}</p>
                {selectedDayTxs.length > 0 && (() => {
                  const inc = selectedDayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                  const exp = selectedDayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                  return (
                    <div className="flex gap-2 text-xs font-medium">
                      {inc > 0 && <span className="text-green-600">+{formatCompact(inc)}</span>}
                      {exp > 0 && <span className="text-red-500">−{formatCompact(exp)}</span>}
                    </div>
                  )
                })()}
              </div>
              {selectedDayTxs.length === 0 ? (
                <p className="text-xs text-brown-300 text-center py-6">Tidak ada transaksi hari ini</p>
              ) : (
                selectedDayTxs.map(tx => {
                  const wallet = wallets.find(w => w.id === tx.walletId)
                  return (
                    <Card key={tx.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                            tx.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                          }`}>
                            {categories.find(c => c.name === tx.category)?.icon || (tx.type === 'income' ? '💰' : '💸')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-brown-950 dark:text-brown-100 truncate">{tx.name}</p>
                            <p className="text-xs text-brown-400">{tx.category}{wallet ? ` · ${wallet.name}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className={`text-sm font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                            </span>
                            <button onClick={() => openEdit(tx)} className="p-2 rounded-xl active:bg-brown-50">
                              <Pencil className="h-3.5 w-3.5 text-brown-300" />
                            </button>
                            <button onClick={() => handleDelete(tx)} className="p-2 rounded-xl active:bg-red-50 -mr-1.5">
                              <Trash2 className="h-3.5 w-3.5 text-red-300" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { resetForm(); setShowForm(true) }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-linear-to-br from-brown-700 to-brown-400 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 active:shadow-sm transition-all z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add / Edit Transaction Dialog */}
      <Dialog
        open={showForm}
        onClose={() => { setShowForm(false); resetForm() }}
        footer={
          aiMode ? (
            <Button onClick={handleAIParse} disabled={aiLoading || !aiInput.trim()} className="w-full h-12 gap-2">
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Memproses...' : 'Parse dengan AI 🐱'}
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full h-12" disabled={!formAmount || !formName}>
              {editTarget ? 'Simpan Perubahan 🐾' : 'Simpan Transaksi 🐾'}
            </Button>
          )
        }
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <CatPaw size={24} className="text-brown-400" />
            {editTarget ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </div>
        </DialogTitle>

        {/* AI input — only for new transactions */}
        {settings.groqApiKey && !editTarget && (
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
              rows={4}
            />
            <div className="rounded-xl bg-brown-50 dark:bg-brown-900/40 p-3">
              <p className="text-[11px] font-semibold text-brown-500 mb-2">Kategori tersedia:</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => (
                  <span key={c.id} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Tabs
              tabs={[
                { id: 'expense', label: '💸 Pengeluaran' },
                { id: 'income', label: '💰 Pemasukan' },
              ]}
              active={formType}
              onChange={(id) => { setFormType(id as TransactionType); setFormCategory('') }}
            />

            <div>
              <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Nama</label>
              <Input placeholder="Nama transaksi" value={formName} onChange={e => setFormName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Nominal</label>
              <Input type="number" placeholder="0" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Tanggal</label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Kategori</label>
                <Select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  options={filteredCategories.map(c => ({ value: c.name, label: `${c.icon || ''} ${c.name}` }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Dompet</label>
              <Select
                value={formWallet}
                onChange={e => setFormWallet(e.target.value)}
                options={wallets.map(w => ({ value: w.id, label: w.name }))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-brown-700 dark:text-brown-300 mb-1 block">Keterangan (opsional)</label>
              <Input placeholder="Detail tambahan..." value={formDescription} onChange={e => setFormDescription(e.target.value)} />
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
