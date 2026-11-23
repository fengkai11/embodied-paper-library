import { createContentLoader } from 'vitepress'

export interface Entry {
  url: string
  slug: string
  title: string
  shortTitle: string
  description: string
  year: number
  category: string
  tags: string[]
  status: string
  updated: string
  question: string
  source: string
  related: string[]
  takeaway: string
  noteType: string
  text: string
}

declare const data: Entry[]
export { data }

export default createContentLoader(['papers/*.md', 'topics/*.md', 'experiments/*.md', 'templates/*.md', 'guide.md'], {
  render: true,
  transform(pages): Entry[] {
    return pages.map(({ url, frontmatter: f, html }) => ({
      url,
      slug: url.split('/').pop()!.replace(/\.html$/, ''),
      title: f.title || '未命名笔记',
      shortTitle: f.shortTitle || f.title || '',
      description: f.description || '',
      year: Number(f.year) || 0,
      category: f.category || '',
      tags: f.tags || [],
      status: f.status || '初稿',
      updated: f.updated || '',
      question: f.question || '',
      source: f.source || '',
      related: f.related || [],
      takeaway: f.takeaway || '',
      noteType: f.noteType || 'guide',
      text: (html || '').replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim(),
    })).sort((a, b) => b.year - a.year || a.shortTitle.localeCompare(b.shortTitle))
  },
})
