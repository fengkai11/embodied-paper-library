<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { data as entries } from '../library.data'
import Icon from './Icon.vue'
const dialog = ref<HTMLDialogElement>()
const input = ref<HTMLInputElement>()
const query = ref('')
const selected = ref(0)
const router = useRouter()
let lastFocus: HTMLElement | null = null
const labels: Record<string,string> = { paper: '论文笔记', topic: '比较专题', experiment: '工程实验', template: '精读模板', guide: '知识库指南' }
const results = computed(() => {
  const tokens = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return entries.filter(e => e.noteType === 'paper').slice(0, 5)
  return entries.map(e => {
    const title = [e.title, e.shortTitle, e.category, ...e.tags].join(' ').toLocaleLowerCase()
    const text = [e.question, e.description, e.text].join(' ').toLocaleLowerCase()
    return { e, score: tokens.every(t => title.includes(t) || text.includes(t)) ? tokens.reduce((n,t) => n + (title.includes(t) ? 4 : 1), 0) : 0 }
  }).filter(e => e.score > 0).sort((a,b) => b.score-a.score).slice(0, 12).map(e => e.e)
})
function snippet(entry: typeof entries[number]) {
  const term = query.value.toLocaleLowerCase().trim().split(/\s+/)[0]
  if (!term) return entry.question || entry.description
  const i = entry.text.toLocaleLowerCase().indexOf(term)
  if (i < 0) return entry.question || entry.description
  return (i > 25 ? '…' : '') + entry.text.slice(Math.max(0, i-25), i+110) + '…'
}
async function open() {
  lastFocus = document.activeElement as HTMLElement
  query.value = ''; selected.value = 0
  dialog.value?.showModal()
  await nextTick(); input.value?.focus()
}
function close() { dialog.value?.close(); lastFocus?.focus() }
function choose(url: string) { close(); router.go(withBase(url)) }
function keys(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    selected.value = Math.max(0, Math.min(results.value.length-1, selected.value + (event.key === 'ArrowDown' ? 1 : -1)))
    document.getElementById(`search-result-${selected.value}`)?.scrollIntoView({ block: 'nearest' })
  } else if (event.key === 'Enter' && results.value[selected.value]) { event.preventDefault(); choose(results.value[selected.value].url) }
}
defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="search-dialog" aria-labelledby="search-title" @click="e => { if (e.target === dialog) close() }" @cancel.prevent="close">
    <h2 id="search-title" class="sr-only">搜索论文与知识库正文</h2>
    <div class="search-dialog-input"><Icon name="search" :size="23" /><input ref="input" v-model="query" @input="selected = 0" @keydown="keys" type="search" placeholder="一个问题、一篇论文、一个概念…" aria-label="搜索知识库正文" role="combobox" aria-autocomplete="list" aria-controls="search-results" :aria-expanded="true" :aria-activedescendant="results.length ? `search-result-${selected}` : undefined" /><button class="icon-button" aria-label="关闭搜索" @click="close"><Icon name="close" /></button></div>
    <div class="search-dialog-label">{{ query.trim() ? `找到 ${results.length} 条相关笔记` : '从这些论文开始' }}<span>本地全文检索</span></div>
    <ul id="search-results" class="search-results" role="listbox" aria-label="搜索结果"><li v-for="(entry, i) in results" :key="entry.url" :id="`search-result-${i}`" role="option" :aria-selected="i === selected" :class="{ highlighted: selected === i }"><a :href="withBase(entry.url)" @click.prevent="choose(entry.url)" @mouseenter="selected = i"><Icon :name="entry.noteType === 'paper' ? 'book' : 'file'" /><span><small>{{ labels[entry.noteType] || '研究笔记' }}</small><strong>{{ entry.title }}</strong><p>{{ snippet(entry) }}</p></span><Icon name="chevron" :size="17" /></a></li></ul>
    <div v-if="!results.length" class="empty-state"><Icon name="search" :size="32" /><h3>暂时没有相关笔记</h3><p>可以试试“价值”“接触”或“世界模型”。</p></div>
    <div class="search-dialog-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> 选择 <kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></div>
  </dialog>
</template>
