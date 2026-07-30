import React, { createContext, useContext, useEffect, useState } from 'react'
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES, translations } from './translations'

interface I18nContextType {
  language: LanguageCode
  setLanguage: (code: LanguageCode) => void
  t: (key: string, fallback?: string) => string
  languageInfo: LanguageInfo
  isRtl: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'foodconnect_language'

function detectDeviceLanguage(): LanguageCode {
  if (typeof window === 'undefined' || !navigator.language) return 'en'
  const browserLang = navigator.language.toLowerCase().split('-')[0] as LanguageCode
  const supported = SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)
  return supported ? browserLang : 'en'
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved
    }
    return detectDeviceLanguage()
  })

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]
  const isRtl = !!currentLangInfo.isRtl

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [language, isRtl])

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations['en']
    if (langDict && langDict[key]) {
      return langDict[key]
    }
    const enDict = translations['en']
    if (enDict && enDict[key]) {
      return enDict[key]
    }
    return fallback || key
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageInfo: currentLangInfo,
        isRtl,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
