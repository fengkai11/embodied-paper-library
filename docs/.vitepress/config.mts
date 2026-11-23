import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'

const base = process.env.SITE_BASE || '/'

export default defineConfig({
  lang: 'zh-CN',
  title: '具身研读',
  titleTemplate: ':title · Embodied Paper Library',
  description: '以研究问题为线索的具身智能论文知识库：读懂机制，连接证据，走向工程验证。',
  base,
  cleanUrls: false,
  outDir: resolve(process.cwd(), 'dist'),
  lastUpdated: false,
  themeConfig: { sourceBranch: process.env.SOURCE_BRANCH || process.env.GITHUB_REF_NAME || 'main' },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#191b27' }],
  ],
  markdown: {
    headers: true,
    math: true,
    config(md) {
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        if (tokens[index].info.trim() === 'mermaid') {
          const source = encodeURIComponent(tokens[index].content)
          return `<MermaidDiagram source="${source}" />`
        }
        return fence(tokens, index, options, env, self)
      }
    },
  },
})
