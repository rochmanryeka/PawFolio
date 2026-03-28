import { useState } from 'react'
import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CatFace, CatSleep, CatHappy } from '@/components/cat-icons'
import { formatCurrency, formatCurrency as fmtCur } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import {
  Download, Upload, Trash2, Eye, Clock, HardDrive, ChevronRight, AlertTriangle
} from 'lucide-react'
import type { BackupData, Transaction } from '@/types'

export default function Backup() {
  const { backups, createBackup, restoreBackup, deleteBackup, transactions, wallets, settings } = useStore()
  const [previewBackup, setPreviewBackup] = useState<BackupData | null>(null)
  const [showRestore, setShowRestore] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<BackupData | null>(null)
  const [importDialog, setImportDialog] = useState(false)

  const handleCreateBackup = () => {
    const backup = createBackup()
    alert(`Backup berhasil dibuat! 🐱\n${formatDate(backup.date)}`)
  }

  const handleExport = (backup: BackupData) => {
    const data = JSON.stringify(backup, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finflow-backup-${new Date(backup.date).toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.transactions && data.wallets && data.version) {
          setRestoreTarget(data)
          setShowRestore(true)
        } else {
          alert('File backup tidak valid')
        }
      } catch {
        alert('Gagal membaca file backup')
      }
    }
    reader.readAsText(file)
    setImportDialog(false)
  }

  const handleRestore = () => {
    if (!restoreTarget) return
    restoreBackup(restoreTarget)
    setShowRestore(false)
    setRestoreTarget(null)
    alert('Data berhasil di-restore! 🐱')
  }

  const handleDeleteBackup = (backup: BackupData) => {
    if (confirm('Hapus backup ini?')) {
      deleteBackup(backup.id)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-purple-500" />
        Backup & Restore
      </h2>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleCreateBackup} className="h-auto py-4 flex-col gap-2">
          <Download className="h-6 w-6" />
          <span className="text-xs">Buat Backup</span>
        </Button>
        <Button variant="outline" onClick={() => setImportDialog(true)} className="h-auto py-4 flex-col gap-2">
          <Upload className="h-6 w-6" />
          <span className="text-xs">Import Backup</span>
        </Button>
      </div>

      {/* Auto backup info */}
      <Card className="border-purple-100 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CatSleep size={32} className="text-purple-400" />
            <div>
              <p className="text-sm font-medium text-purple-800">Auto Backup Harian</p>
              <p className="text-xs text-purple-400">
                {settings.autoBackup ? '✅ Aktif' : '❌ Nonaktif'} — Backup terakhir: {
                  settings.lastBackupDate ? formatDate(settings.lastBackupDate) : 'Belum ada'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current data summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CatFace size={20} className="text-purple-500" />
            Data Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-xl font-bold text-purple-700">{transactions.length}</p>
              <p className="text-xs text-purple-400">Transaksi</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-xl font-bold text-purple-700">{wallets.length}</p>
              <p className="text-xs text-purple-400">Dompet</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-xl font-bold text-purple-700">{backups.length}</p>
              <p className="text-xs text-purple-400">Backup</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup list */}
      <div>
        <h3 className="text-sm font-semibold text-purple-700 mb-2">Riwayat Backup</h3>
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <CatSleep size={48} className="mx-auto text-purple-300 mb-3" />
            <p className="text-purple-400 text-sm">Belum ada backup</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map(backup => (
              <Card key={backup.id} className="group">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          {formatDate(backup.date)}
                        </p>
                        <p className="text-xs text-purple-400">
                          {backup.transactions.length} transaksi · {backup.wallets.length} dompet
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewBackup(backup)}
                        className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4 text-purple-400" />
                      </button>
                      <button
                        onClick={() => handleExport(backup)}
                        className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Export"
                      >
                        <Download className="h-4 w-4 text-purple-400" />
                      </button>
                      <button
                        onClick={() => { setRestoreTarget(backup); setShowRestore(true) }}
                        className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Restore"
                      >
                        <Upload className="h-4 w-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewBackup} onClose={() => setPreviewBackup(null)}>
        {previewBackup && (
          <>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                Preview Backup
              </div>
            </DialogTitle>
            <div className="space-y-4">
              <div className="rounded-xl bg-purple-50 p-3 space-y-1">
                <p className="text-sm font-medium text-purple-800">📅 {formatDate(previewBackup.date)}</p>
                <p className="text-xs text-purple-400">Versi: {previewBackup.version}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-green-50 p-3 text-center">
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(previewBackup.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
                  </p>
                  <p className="text-xs text-green-500">Total Pemasukan</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 text-center">
                  <p className="text-lg font-bold text-red-700">
                    {formatCurrency(previewBackup.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                  </p>
                  <p className="text-xs text-red-500">Total Pengeluaran</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-purple-600 mb-2">Dompet ({previewBackup.wallets.length})</p>
                <div className="space-y-1">
                  {previewBackup.wallets.map(w => (
                    <div key={w.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }} />
                        <span className="text-purple-800">{w.name}</span>
                      </div>
                      <span className="text-purple-600 font-medium">{formatCurrency(w.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-purple-600 mb-2">
                  Transaksi Terakhir ({previewBackup.transactions.length} total)
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {previewBackup.transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white">
                      <div>
                        <span className="text-purple-800">{tx.name}</span>
                        <span className="text-purple-300 ml-2">{formatDate(tx.date)}</span>
                      </div>
                      <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => { setRestoreTarget(previewBackup); setPreviewBackup(null); setShowRestore(true) }}
                variant="outline"
                className="w-full"
              >
                Restore Backup Ini
              </Button>
            </div>
          </>
        )}
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestore} onClose={() => setShowRestore(false)}>
        <DialogTitle>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Konfirmasi Restore
          </div>
        </DialogTitle>
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-4">
            <CatFace size={32} className="text-amber-500 mb-2" />
            <p className="text-sm text-amber-800">
              Restore akan menimpa <strong>semua data saat ini</strong> dengan data dari backup.
              Pastikan Anda sudah membuat backup data saat ini.
            </p>
          </div>
          {restoreTarget && (
            <div className="text-sm text-purple-600">
              <p>📅 Backup: {formatDate(restoreTarget.date)}</p>
              <p>📊 {restoreTarget.transactions.length} transaksi, {restoreTarget.wallets.length} dompet</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRestore(false)} className="flex-1">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleRestore} className="flex-1">
              Ya, Restore
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Backup 🐱</DialogTitle>
        <div className="space-y-4">
          <p className="text-sm text-purple-600">Pilih file backup JSON yang sudah di-export sebelumnya.</p>
          <Input
            type="file"
            accept=".json"
            onChange={handleImport}
          />
        </div>
      </Dialog>
    </div>
  )
}
