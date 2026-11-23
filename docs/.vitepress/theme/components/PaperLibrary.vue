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
const failedImages = ref<Record<string, boolean>>({})
const papers = entries.filter(e => e.noteType === 'paper')
const categories = ['全部', 'VLA', 'RL', '世界模型', '精密操作']
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
    <div class="paper-list" aria-live="polite"><article v-for="paper in filtered" :key="paper.slug" class="paper-row"><a class="paper-main" :href="withBase(paper.url)"><span class="paper-visual"><img v-if="paper.visual?.image && !failedImages[paper.slug]" :src="withBase(paper.visual.image)" :alt="paper.visual.alt || `${paper.shortTitle} 论文图像`" width="160" height="100" loading="lazy" decoding="async" @error="failedImages[paper.slug] = true" /><span v-else class="visual-placeholder"><Icon name="book" :size="23" /><span>论文笔记</span></span></span><span class="paper-details"><span class="paper-title">{{ paper.shortTitle }} <span class="paper-year">{{ paper.year }}</span></span><span class="paper-question">{{ paper.question || paper.description }}</span><span class="paper-tags"><span>{{ paper.category }}</span><span v-for="tag in paper.tags.filter(t => t !== paper.category).slice(0, 1)" :key="tag">{{ tag }}</span></span></span></a><div class="paper-row-end"><span class="draft-label">{{ paper.status }}</span><button class="icon-button bookmark-button" :class="{ bookmarked: saved.includes(paper.slug) }" :aria-label="(saved.includes(paper.slug) ? '取消收藏 ' : '收藏 ') + paper.shortTitle" :aria-pressed="saved.includes(paper.slug)" @click="toggleSaved(paper.slug)"><Icon name="bookmark" :size="18" /></button></div></article>
      <div v-if="!filtered.length" class="empty-state"><Icon :name="onlySaved ? 'bookmark' : 'search'" :size="32" /><h3>{{ onlySaved && !saved.length ? '为值得回看的论文留个位置' : '没有找到符合条件的论文' }}</h3><p>{{ onlySaved && !saved.length ? '在论文旁点击书签，即可加入这里。' : '试试其他关键词，或清除类别筛选。' }}</p><a v-if="onlySaved && !saved.length" class="button secondary" :href="withBase('/library.html')">浏览论文库</a><button v-else class="button secondary" @click="reset">清除筛选</button></div>
    </div>
    <p v-if="!compact && filtered.length" class="library-caption">共 {{ filtered.length }} 篇 · 年份按首次公开稿记录 · 笔记状态与个人掌握程度分开记录</p>
  </div>
</template>

<style scoped>
.paper-row { gap: 18px; padding: 22px; }
.paper-main { display: grid; grid-template-columns: 150px minmax(0, 1fr); align-items: center; gap: 21px; min-width: 0; }
.paper-visual { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; width: 100%; height: 102px; border: 1px solid var(--border, #e6e8ee); border-radius: 8px; background: #fff; overflow: hidden; }
.paper-visual img { display: block; box-sizing: border-box; min-width: 0; min-height: 0; width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; padding: 6px; }
.visual-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #837e8e; font-size: 12px; }
.paper-details { min-width: 0; }
.paper-title { display: flex; flex-wrap: wrap; align-items: baseline; gap: 5px 10px; font-size: 18px; line-height: 1.45; }
.paper-year { font-size: 12px; white-space: nowrap; }
.paper-question { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-width: none; margin-top: 7px; overflow: hidden; text-overflow: ellipsis; white-space: normal; font-size: 14px; line-height: 1.75; }
.paper-tags { flex-wrap: wrap; gap: 5px; margin-top: 11px; font-size: 12px; line-height: 1.5; }
.paper-tags > span { overflow-wrap: anywhere; }
.paper-row-end { flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
.bookmark-button { width: 40px; height: 40px; min-width: 40px; min-height: 40px; }
.paper-main:focus-visible, .bookmark-button:focus-visible { outline: 3px solid var(--accent, #5d51c9); outline-offset: 4px; border-radius: 5px; }
.compact .paper-row { gap: 12px; padding: 20px; }
.compact .paper-main { grid-template-columns: 113px minmax(0, 1fr); gap: 16px; }
.compact .paper-visual { height: 88px; }
.compact .paper-title { font-size: 17px; }
.compact .paper-question { font-size: 14px; }
.compact .paper-row-end .draft-label { display: none; }
@media (max-width: 1280px) {
  .compact .paper-row { padding: 18px 16px; gap: 8px; }
  .compact .paper-main { grid-template-columns: 94px minmax(0, 1fr); gap: 13px; }
  .compact .paper-visual { height: 80px; }
  .compact .paper-title { font-size: 16px; }
}
@media (max-width: 1000px) {
  .compact .paper-main { grid-template-columns: 128px minmax(0, 1fr); gap: 18px; }
  .compact .paper-visual { height: 91px; }
  .compact .paper-row { padding: 21px; }
  .paper-row-end .draft-label { display: none; }
}
@media (max-width: 760px) {
  .paper-row, .compact .paper-row { padding: 19px 17px; gap: 10px; }
  .paper-main, .compact .paper-main { grid-template-columns: 116px minmax(0, 1fr); gap: 16px; }
  .paper-visual, .compact .paper-visual { height: 89px; }
  .paper-title, .compact .paper-title { font-size: 17px; }
  .paper-tags { font-size: 12px; }
}
@media (max-width: 540px) {
  .paper-row, .compact .paper-row { position: relative; display: block; padding: 19px; }
  .paper-main, .compact .paper-main { display: flex; flex-direction: column; align-items: stretch; gap: 15px; width: 100%; }
  .paper-visual, .compact .paper-visual { height: clamp(120px, 34vw, 170px); }
  .paper-visual img { padding: 9px; }
  .paper-title, .compact .paper-title { font-size: 18px; }
  .paper-question, .compact .paper-question { font-size: 14px; -webkit-line-clamp: 3; }
  .paper-tags { min-height: 30px; align-items: center; margin-top: 11px; padding-right: 42px; }
  .paper-row-end { position: absolute; right: 15px; bottom: 15px; }
  .bookmark-button { width: 40px; height: 40px; }
}
@media (max-width: 360px) {
  .paper-row, .compact .paper-row { padding: 17px; }
  .paper-main, .compact .paper-main { gap: 13px; }
}
</style>
