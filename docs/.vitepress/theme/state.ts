import { ref } from 'vue'

export const saved = ref<string[]>([])
export const reviews = ref<Record<string, string>>({})
export const history = ref<{ slug: string; at: string }[]>([])
export const storageAvailable = ref(true)
export const isDark = ref(false)
const KEY = 'embodied-paper-library:v1'
let initialized = false

export function initLocalState() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    saved.value = Array.isArray(raw.saved) ? raw.saved.filter((s: unknown) => typeof s === 'string') : []
    reviews.value = raw.reviews && typeof raw.reviews === 'object' && !Array.isArray(raw.reviews)
      ? Object.fromEntries(Object.entries(raw.reviews).filter(([_, v]) => typeof v === 'string' && !Number.isNaN(Date.parse(v)))) as Record<string,string>
      : {}
    history.value = Array.isArray(raw.history) ? raw.history.filter((h: any) => typeof h?.slug === 'string' && typeof h?.at === 'string').slice(0, 12) : []
    isDark.value = raw.dark === true
    document.documentElement.classList.toggle('dark', isDark.value)
  } catch { storageAvailable.value = false }
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ saved: saved.value, reviews: reviews.value, history: history.value, dark: isDark.value }))
    storageAvailable.value = true
  } catch { storageAvailable.value = false }
}
export function toggleSaved(slug: string) {
  saved.value = saved.value.includes(slug) ? saved.value.filter(s => s !== slug) : [...saved.value, slug]
  persist()
}
export function markReviewed(slug: string) { reviews.value = { ...reviews.value, [slug]: new Date().toISOString() }; persist() }
export function unmarkReviewed(slug: string) { const next = { ...reviews.value }; delete next[slug]; reviews.value = next; persist() }
export function visit(slug: string) {
  history.value = [{ slug, at: new Date().toISOString() }, ...history.value.filter(h => h.slug !== slug)].slice(0, 12)
  persist()
}
export function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  persist()
}
