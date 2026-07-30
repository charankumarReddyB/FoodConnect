import { Globe, X, Check, Search } from 'lucide-react'
import { useState } from 'react'
import { SUPPORTED_LANGUAGES } from './translations'
import { useTranslation } from './i18nContext'

interface LanguageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage, t } = useTranslation()
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-poppins">{t('selectLanguage')}</h2>
              <p className="text-xs text-slate-500">13 Indian Regional Languages Supported</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border bg-surface">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search language / भाषा खोजें..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {filteredLanguages.map((l) => {
            const isSelected = language === l.code
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code)
                  onClose()
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left cursor-pointer btn-press ${
                  isSelected
                    ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.flag}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{l.nativeName}</p>
                    <p className="text-xs text-slate-400">{l.name}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
