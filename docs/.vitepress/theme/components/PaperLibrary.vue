<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../library.data'
import { saved, toggleSaved } from '../state'
import Icon from './Icon.vue'
const props = defineProps<{ compact?: boolean; onlySaved?: boolean }>()
const q = ref('')
const category = ref('全部')
const sort = ref('year')
const papers = entries.filter(e => e.noteType === 'paper')
const categories = ['全部', 'VLA', 'RL', '世界模型', '精密操作']
const symbols: Record<string,string> = { VLA: 'π', RL: 'Q', '世界模型': 'W', '精密操作': 'M' }
const colorClasses: Record<string,string> = { VLA: 'purple', RL: 'blue', '世界模型': 'teal', '精密操作': 'amber' }
const filtered = computed(() => {
  const term = q.value.trim().toLocaleLowerCase()
  const result = papers.filter(p => (!props.onlySaved || saved.value.includes(p.slug)) && (category.value === '全部' || category.value === p.category) && (!term || [p.title, p.description, p.question, p.text, ...p.tags].join(' ').toLocaleLowerCase().includes(term)))
  return result.sort((a,b) => sort.value === 'title' ? a.shortTitle.localeCompare(b.shortTitle) : b.year-a.year || a.shortTitle.localeCompare(b.shortTitle))
})
function reset() { q.value = ''; category.value = '全部' }
</script>

<template>
  <div :class="['paper-library', { compact }]">
    <div v-if="!compact" class="page-heading"><div><p class="eyebrow">{{ onlySaved ? 'YOUR READING SHELF' : 'THE PAPER COLLECTION' }}</p><h1>{{ onlySaved ? '收藏的论文' : '论文库' }}</h1><p class="page-subtitle">{{ onlySaved ? '把值得反复思考的论文，放到随手能找到的地方。收藏保存在此浏览器。' : '按研究问题寻找论文，按机制理解方法。每一篇都有通往实验的入口。' }}</p></div></div>
    <div v-else class="section-title-row"><h2>论文索引 <span>{{ papers.length }}</span></h2><a :href="withBase('/library.html')">查看全部 <Icon name="chevron" :size="16" /></a></div>
    <div v-if="!compact" class="library-controls"><label class="library-search"><Icon name="search" :size="19" /><input v-model="q" type="search" aria-label="检索论文正文" placeholder="搜索标题、机制、公式概念…" /></label><label class="sort-control">排序<select v-model="sort" aria-label="论文排序"><option value="year">初稿年份 · 最新</option><option value="title">标题 · A–Z</option></select></label></div>
    <div class="category-tabs" role="group" aria-label="论文类别"><button v-for="cat in categories" :key="cat" :class="{ selected: category === cat }" :aria-pressed="category === cat" @click="category = cat">{{ cat === '全部' ? '全部论文' : cat }}<span v-if="category === cat">{{ filtered.length }}</span></button></div>
    <div class="paper-list" aria-live="polite"><article v-for="paper in filtered" :key="paper.slug" class="paper-row"><a class="paper-main" :href="withBase(paper.url)"><span class="paper-symbol" :class="colorClasses[paper.category]">{{ symbols[paper.category] || 'P' }}</span><span class="paper-details"><span class="paper-title">{{ paper.shortTitle }} <span class="paper-year">{{ paper.year }}</span></span><span class="paper-question">{{ paper.question || paper.description }}</span><span class="paper-tags"><span>{{ paper.category }}</span><span v-for="tag in paper.tags.filter(t => t !== paper.category).slice(0, 1)" :key="tag">{{ tag }}</span></span></span></a><div class="paper-row-end"><span class="draft-label">{{ paper.status }}</span><button class="icon-button bookmark-button" :class="{ bookmarked: saved.includes(paper.slug) }" :aria-label="(saved.includes(paper.slug) ? '取消收藏 ' : '收藏 ') + paper.shortTitle" :aria-pressed="saved.includes(paper.slug)" @click="toggleSaved(paper.slug)"><Icon name="bookmark" :size="18" /></button></div></article>
      <div v-if="!filtered.length" class="empty-state"><Icon :name="onlySaved ? 'bookmark' : 'search'" :size="32" /><h3>{{ onlySaved && !saved.length ? '为值得回看的论文留个位置' : '没有找到符合条件的论文' }}</h3><p>{{ onlySaved && !saved.length ? '在论文旁点击书签，即可加入这里。' : '试试其他关键词，或清除类别筛选。' }}</p><a v-if="onlySaved && !saved.length" class="button secondary" :href="withBase('/library.html')">浏览论文库</a><button v-else class="button secondary" @click="reset">清除筛选</button></div>
    </div>
    <p v-if="!compact && filtered.length" class="library-caption">共 {{ filtered.length }} 篇 · 年份按首次公开稿记录 · 笔记状态与个人掌握程度分开记录</p>
  </div>
</template>
