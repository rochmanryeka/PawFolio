import { useMemo, useState } from 'react'
import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CatHappy, CatMoney, CatSleep } from '@/components/cat-icons'
import { formatCurrency } from '@/lib/utils'
import { getMonthPeriod, getNextPeriod, getPrevPeriod, isInPeriod, formatDate } from '@/lib/date-utils'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#818cf8', '#fb923c']

export default function Dashboard() {
  const { transactions, wallets, settings } = useStore()
  const [period, setPeriod] = useState(() => getMonthPeriod(new Date(), settings.monthStartDay))

  const periodTransactions = useMemo(
    () => transactions.filter(t => isInPeriod(t.date, period)),
    [transactions, period]
  )

  const totalIncome = useMemo(
    () => periodTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [periodTransactions]
  )

  const totalExpense = useMemo(
    () => periodTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [periodTransactions]
  )

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

  // Daily spending data for area chart
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; income: number; expense: number }> = {}
    periodTransactions.forEach(t => {
      const day = t.date.split('T')[0]
      if (!map[day]) map[day] = { date: day, income: 0, expense: 0 }
      if (t.type === 'income') map[day].income += t.amount
      else map[day].expense += t.amount
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }, [periodTransactions])

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    periodTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [periodTransactions])

  // Wallet distribution for bar chart
  const walletData = useMemo(
    () => wallets.map(w => ({ name: w.name, balance: w.balance, color: w.color })),
    [wallets]
  )

  const recentTransactions = periodTransactions.slice(0, 5)

  const catMood = totalIncome > totalExpense ? 'happy' : totalExpense > 0 ? 'worried' : 'sleep'

  return (
    <div className="space-y-4 pb-20">
      {/* Period navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setPeriod(p => getPrevPeriod(p, settings.monthStartDay))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-purple-800 capitalize">{period.label}</h2>
        <Button variant="ghost" size="icon" onClick={() => setPeriod(p => getNextPeriod(p, settings.monthStartDay))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Cat mascot + total balance */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none overflow-hidden relative">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Saldo 🐱</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-200" />
                  <span className="text-sm text-purple-100">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-200" />
                  <span className="text-sm text-purple-100">{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </div>
            <div className="text-white/80">
              {catMood === 'happy' ? <CatHappy size={72} /> : catMood === 'worried' ? <CatMoney size={72} /> : <CatSleep size={72} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Pemasukan</span>
            </div>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600 font-medium">Pengeluaran</span>
            </div>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            Dompet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallets.length === 0 ? (
            <p className="text-sm text-purple-300">Belum ada dompet</p>
          ) : (
            <div className="space-y-2">
              {wallets.map(w => (
                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color || '#a78bfa' }} />
                    <span className="text-sm font-medium text-purple-800">{w.name}</span>
                    <Badge variant="outline">{w.type}</Badge>
                  </div>
                  <span className={`text-sm font-semibold ${w.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(w.balance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending trend chart */}
      {dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Tren Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="date" tickFormatter={(v) => v.split('-')[2]} tick={{ fontSize: 11 }} stroke="#c4b5fd" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="#c4b5fd" />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e9d5ff', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="income" stroke="#34d399" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f87171" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🐱 Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {categoryData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-purple-700">{item.name}</span>
                    </div>
                    <span className="text-purple-500 font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet balance chart */}
      {walletData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Saldo per Dompet</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={walletData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="#c4b5fd" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#c4b5fd" width={60} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
                  {walletData.map((entry, index) => (
                    <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>🐾 Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6">
              <CatSleep size={48} className="mx-auto text-purple-300 mb-2" />
              <p className="text-sm text-purple-400">Belum ada transaksi bulan ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'income' ? '↗' : '↘'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">{tx.name}</p>
                      <p className="text-xs text-purple-400">{formatDate(tx.date)} · {tx.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
