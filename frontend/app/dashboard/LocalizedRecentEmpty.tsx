"use client"
import { EmptyState } from "@/components/ui/EmptyState"
import { useLanguage } from "@/context/LanguageContext"
import { accountText } from "@/data/content/account"
import { pick } from "@/data/i18n/core"

export default function LocalizedRecentEmpty() {
  const { lang } = useLanguage()
  return (
    <EmptyState
      title={pick(lang, accountText.dashboard.recentEmptyTitle)}
      description={pick(lang, accountText.dashboard.recentEmptyDesc)}
    />
  )
}
