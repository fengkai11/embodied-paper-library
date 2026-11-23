import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

// A small authoring guard: reject missing metadata and dangling related-paper slugs.
// Markdown rendering and internal page links are validated by VitePress during build.
const folder = join(process.cwd(), 'docs/papers')
const files = readdirSync(folder).filter(name => name.endsWith('.md'))
const slugs = new Set(files.map(name => name.slice(0, -3)))
const required = ['title', 'shortTitle', 'description', 'year', 'category', 'tags', 'status', 'updated', 'question', 'source', 'related', 'takeaway', 'noteType']
const errors = []
for (const name of files) {
  const text = readFileSync(join(folder, name), 'utf8')
  let parsed
  try { parsed = matter(text) } catch(error) { errors.push(`${name}: invalid YAML: ${error.message}`); continue }
  const meta = parsed.data
  for (const key of required) if (meta[key] === undefined || meta[key] === null || meta[key] === '') errors.push(`${name}: missing ${key}`)
  if (typeof meta.source !== 'string' || !/^https:\/\//.test(meta.source)) errors.push(`${name}: source must be an HTTPS URL`)
  if (!Number.isInteger(meta.year) || meta.year < 1900 || meta.year > 2100) errors.push(`${name}: year must be an integer publication year`)
  if (!['VLA','RL','世界模型','精密操作'].includes(meta.category)) errors.push(`${name}: unsupported category ${meta.category}`)
  if (meta.noteType !== 'paper') errors.push(`${name}: noteType must be paper`)
  if (!Array.isArray(meta.tags)) errors.push(`${name}: tags must be a YAML array`)
  if (!Array.isArray(meta.related)) errors.push(`${name}: related must be a YAML array`)
  for (const slug of Array.isArray(meta.related) ? meta.related : []) {
    if (!slugs.has(slug)) errors.push(`${name}: unknown related paper ${slug}`)
  }
  if (/^#\s/m.test(parsed.content)) errors.push(`${name}: put the page title in frontmatter, not a second H1`)
}
for (const page of ['docs/index.md','docs/library.md','docs/routes.md','docs/review.md','docs/topics/index.md','docs/experiments/index.md','docs/templates/paper.md']) {
  if (!existsSync(page)) errors.push(`Missing page: ${page}`)
}
const imageSources = JSON.parse(readFileSync('design/image-sources.json', 'utf8'))
const imageSlugs = new Set()
for (const image of imageSources) {
  if (!slugs.has(image.slug) || imageSlugs.has(image.slug)) errors.push(`Invalid or duplicate image slug: ${image.slug}`)
  imageSlugs.add(image.slug)
  if (!/^\/papers\/[a-z0-9-]+\.webp$/.test(image.image) || !existsSync(join('docs/public', image.image))) errors.push(`Missing or invalid image asset: ${image.image}`)
  for (const key of ['alt', 'caption', 'kind', 'credit']) if (!image[key]?.trim()) errors.push(`${image.slug}: missing image ${key}`)
  for (const key of ['sourcePage', 'originalImageUrl']) if (!/^https:\/\//.test(image[key])) errors.push(`${image.slug}: missing HTTPS ${key}`)
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
else console.log(`Validated ${files.length} paper notes and ${imageSources.length} image sources: metadata, assets, sources, related links and page entry points.`)
