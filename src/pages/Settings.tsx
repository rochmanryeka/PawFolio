import { useState } from 'react'
import { useStore } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CatWave, CatHappy } from '@/components/cat-icons'
import {
  Settings as SettingsIcon, Calendar, Key, Palette, Info, Cat
} from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings, categories, addCategory, deleteCategory } = useStore()
  const [apiKey, setApiKey] = useState(settings.groqApiKey || '')
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense')
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSaveApiKey = () => {
    updateSettings({ groqApiKey: apiKey })
    alert('API Key disimpan! 🐱')
  }

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    addCategory({ name: newCatName, type: newCatType })
    setNewCatName('')
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-purple-500" />
        Pengaturan
      </h2>

      {/* Month start day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Awal Bulan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-purple-400 mb-2">
            Pilih tanggal mulai periode bulanan (misal tanggal gajian)
          </p>
          <Select
            value={settings.monthStartDay.toString()}
            onChange={e => updateSettings({ monthStartDay: parseInt(e.target.value) })}
            options={Array.from({ length: 28 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Tanggal ${i + 1}`,
            }))}
          />
        </CardContent>
      </Card>

      {/* Groq API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4 text-purple-500" />
            Groq AI Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-purple-400 mb-2">
            Masukkan API key Groq untuk menggunakan fitur input transaksi via AI.
            Dapatkan key di{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
              console.groq.com
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              placeholder="gsk_..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? '🙈' : '👁'}
            </Button>
          </div>
          <Button onClick={handleSaveApiKey} size="sm" className="mt-2 w-full">
            Simpan API Key 🐾
          </Button>
          {settings.groqApiKey && (
            <p className="text-xs text-green-500 mt-2">✅ API Key sudah tersimpan</p>
          )}
        </CardContent>
      </Card>

      {/* Auto backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-500" />
            Auto Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">Backup otomatis harian</p>
            <button
              onClick={() => updateSettings({ autoBackup: !settings.autoBackup })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoBackup ? 'bg-purple-500' : 'bg-purple-200'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.autoBackup ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Cat className="h-4 w-4 text-purple-500" />
            Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Add new */}
            <div className="flex gap-2">
              <Input
                placeholder="Nama kategori"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="flex-1"
              />
              <Select
                value={newCatType}
                onChange={e => setNewCatType(e.target.value as 'income' | 'expense')}
                options={[
                  { value: 'expense', label: 'Keluar' },
                  { value: 'income', label: 'Masuk' },
                ]}
                className="w-24"
              />
              <Button size="sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>+</Button>
            </div>

            {/* List */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600 mt-2">💰 Pemasukan</p>
              {categories.filter(c => c.type === 'income').map(cat => (
                <div key={cat.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-50/50">
                  <span className="text-purple-800">{cat.icon} {cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}

              <p className="text-xs font-medium text-red-600 mt-3">💸 Pengeluaran</p>
              {categories.filter(c => c.type === 'expense').map(cat => (
                <div key={cat.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-red-50/50">
                  <span className="text-purple-800">{cat.icon} {cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-4 text-center">
          <CatWave size={80} className="mx-auto text-purple-400 mb-3" />
          <p className="text-lg font-bold text-purple-800">FinFlow 🐱</p>
          <p className="text-xs text-purple-400 mt-1">Keuangan pribadimu, lebih mudah & menyenangkan</p>
          <p className="text-xs text-purple-300 mt-2">v1.0.0 • Made with 💜</p>
        </CardContent>
      </Card>
    </div>
  )
}
