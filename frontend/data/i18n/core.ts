export type Lang = "en" | "th"
export const LANG: Record<Uppercase<Lang>, Lang> = { EN: "en", TH: "th" }

export type Localized<T> = { en: T; th: T }

export const digitsOnly = (v = "") => String(v).replace(/[^\d]/g, "")

export function pick<T>(lang: Lang, value: Localized<T> | T): T {
  if (value && typeof value === "object" && "en" in (value as any) && "th" in (value as any)) {
    const v = value as Localized<T>
    return (v[lang] ?? v.en ?? v.th) as T
  }
  return value as T
}