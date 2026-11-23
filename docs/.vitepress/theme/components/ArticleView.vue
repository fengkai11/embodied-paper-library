<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData, withBase } from 'vitepress'
import { data as entries } from '../library.data'
import { saved, toggleSaved } from '../state'
import Icon from './Icon.vue'
const { page, frontmatter: fm, theme } = useData()
const slug = computed(() => page.value.relativePath.split('/').pop()!.replace(/\.md$/, ''))
const isPaper = computed(() => fm.value.noteType === 'paper')
const headers = computed(() => page.value.headers || [])
const related = computed(() => entries.filter(e => e.noteType === 'paper' && (fm.value.related || []).includes(e.slug)))
const editUrl = computed(() => `https://github.com/fengkai11/embodied-paper-library/edit/${theme.value.sourceBranch || 'main'}/docs/${page.value.relativePath}`)
const labels: Record<string,string> = { paper: '论文精读', topic: '专题比较', experiment: '实验记录', template: '精读模板', guide: '使用指南' }
</script>

<template>
  <div class="article-layout">
    <article class="reading-column">
      <header class="article-header"><div class="article-eyebrow"><a :href="withBase(isPaper ? '/library.html' : '/')">{{ isPaper ? '论文库' : '研究首页' }}</a><span>/</span><span>{{ labels[fm.noteType] || '研究笔记' }}</span></div><div class="article-badges"><span v-if="fm.category" class="category-badge">{{ fm.category }}</span><span v-if="fm.year">{{ fm.year }} · 首次公开稿</span><span v-if="fm.status" class="draft-label">{{ fm.status }}</span></div><h1>{{ fm.title || page.title }}</h1><p class="article-deck">{{ fm.description }}</p><div class="article-actions"><a v-if="fm.source" class="button secondary" :href="fm.source" target="_blank" rel="noopener noreferrer"><Icon name="external" :size="16" />论文原文</a><button v-if="isPaper" class="button secondary" :class="{ 'is-saved': saved.includes(slug) }" :aria-pressed="saved.includes(slug)" @click="toggleSaved(slug)"><Icon name="bookmark" :size="16" />{{ saved.includes(slug) ? '已收藏' : '收藏论文' }}</button><span v-if="fm.updated" class="article-date">笔记更新于 {{ fm.updated }}</span></div></header>
      <div v-if="isPaper && fm.status === '速览草稿'" class="draft-notice"><Icon name="file" :size="18" /><p><strong>速览草稿 · 待精读校对</strong>本页用于建立机制与问题的索引，后续逐项补充原文公式、图表及实验依据。</p></div>
      <details v-if="headers.length" class="mobile-toc"><summary>本页目录</summary><nav><a v-for="heading in headers" :key="heading.slug" :href="heading.link">{{ heading.title }}</a></nav></details>
      <Content class="prose" />
      <section v-if="related.length" class="related-section"><h2>把这一篇，接到下一篇</h2><div class="related-grid"><a v-for="entry in related" :key="entry.slug" :href="withBase(entry.url)"><span>{{ entry.category }}</span><h3>{{ entry.shortTitle }}</h3><p>{{ entry.question }}</p></a></div></section>
      <div class="article-footnote"><span>论文事实、作者主张、研究推断与待验证结论分别记录。</span><a :href="editUrl" target="_blank" rel="noopener noreferrer">在 GitHub 编辑 <Icon name="external" :size="13" /></a></div>
    </article>
    <aside class="article-rail"><nav v-if="headers.length" class="toc" aria-label="本页目录"><h2>本页目录</h2><a v-for="heading in headers" :key="heading.slug" :href="heading.link">{{ heading.title }}</a></nav><div class="reading-reminder"><Icon name="spark" :size="19" /><h3>带走一个判断</h3><p>它为什么有效？<br>什么证据支持？<br>我可以怎样验证？</p><a :href="withBase('/review.html')">进入复习中心</a></div><p class="local-note">收藏与复习记录<br>仅保存在此浏览器</p></aside>
  </div>
</template>
