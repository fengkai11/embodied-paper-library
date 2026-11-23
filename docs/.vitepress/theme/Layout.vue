<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { data as entries } from './library.data'
import { initLocalState, saved, isDark, toggleTheme, visit, storageAvailable } from './state'
import Icon from './components/Icon.vue'
import Dashboard from './components/Dashboard.vue'
import PaperLibrary from './components/PaperLibrary.vue'
import ArticleView from './components/ArticleView.vue'
import ResearchRoutes from './components/ResearchRoutes.vue'
import ReviewCenter from './components/ReviewCenter.vue'
import SearchDialog from './components/SearchDialog.vue'

const { page, frontmatter } = useData()
const route = useRoute()
const menuOpen = ref(false)
const search = ref<InstanceType<typeof SearchDialog>>()
const papers = entries.filter(e => e.noteType === 'paper')
const links = [
  { label: '研究首页', icon: 'grid', path: '/', view: 'home' },
  { label: '论文库', icon: 'book', path: '/library.html', view: 'library' },
  { label: '技术路线', icon: 'map', path: '/routes.html', view: 'routes' },
  { label: '专题比较', icon: 'layers', path: '/topics/', view: 'topics' },
  { label: '实验记录', icon: 'flask', path: '/experiments/', view: 'experiments' },
  { label: '复习中心', icon: 'repeat', path: '/review.html', view: 'review' },
]
const activeView = computed(() => {
  if (frontmatter.value.view) return frontmatter.value.view
  if (route.path.includes('/papers/')) return 'library'
  if (route.path.includes('/topics/')) return 'topics'
  if (route.path.includes('/experiments/')) return 'experiments'
  return ''
})
function track() {
  menuOpen.value = false
  const paper = papers.find(p => withBase(p.url) === route.path.split(/[?#]/)[0])
  if (paper) visit(paper.slug)
}
function onKeys(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.value?.open() }
  if (event.key === 'Escape') menuOpen.value = false
}
onMounted(() => { initLocalState(); track(); window.addEventListener('keydown', onKeys) })
onUnmounted(() => window.removeEventListener('keydown', onKeys))
watch(() => route.path, track)
watch(menuOpen, async (open) => {
  if (open) { await nextTick(); document.querySelector<HTMLAnchorElement>('.sidebar .main-nav a')?.focus() }
})
</script>

<template>
  <a class="skip-link" href="#main-content">跳转到正文</a>
  <button v-if="menuOpen" class="nav-overlay" aria-label="关闭导航" @click="menuOpen = false"></button>
  <aside class="sidebar" :class="{ 'is-open': menuOpen }" aria-label="知识库导航">
    <a class="brand" :href="withBase('/')">
      <span class="brand-symbol"><Icon name="layers" :size="23" /></span>
      <span><strong>具身研读<span class="brand-period">.</span></strong><small>PAPER LIBRARY</small></span>
    </a>
    <div class="workspace-label">研究工作台 <span>PERSONAL</span></div>
    <nav class="main-nav" aria-label="主导航">
      <a v-for="link in links" :key="link.path" :href="withBase(link.path)" :class="{ active: activeView === link.view && !frontmatter.saved }" :aria-current="activeView === link.view && !frontmatter.saved ? 'page' : undefined">
        <Icon :name="link.icon" /><span>{{ link.label }}</span><span v-if="link.view === 'library'" class="nav-count">{{ papers.length }}</span>
      </a>
    </nav>
    <div class="nav-section-title">我的书架</div>
    <nav class="main-nav" aria-label="个人记录">
      <a :href="withBase('/saved.html')" :class="{ active: frontmatter.saved }" :aria-current="frontmatter.saved ? 'page' : undefined"><Icon name="bookmark" /><span>收藏的论文</span><span class="nav-count">{{ saved.length }}</span></a>
      <a :href="withBase('/templates/paper.html')"><Icon name="file" /><span>精读模板</span></a>
    </nav>
    <div class="sidebar-note">
      <span class="note-icon"><Icon name="spark" :size="17" /></span>
      <p>读懂一篇，<br>连接一个研究问题。</p>
      <a :href="withBase('/guide.html')">知识库使用指南 <Icon name="chevron" :size="14" /></a>
    </div>
    <div class="sidebar-bottom">
      <a class="repo-link" href="https://github.com/fengkai11/embodied-paper-library" target="_blank" rel="noopener noreferrer"><Icon name="github" /><span>GitHub 仓库<small>fengkai11 / embodied-paper-library</small></span><Icon name="external" :size="14" /></a>
      <div class="sidebar-bottom-line"><span>持续生长的研究笔记</span><button class="theme-toggle" @click="toggleTheme" :aria-label="isDark ? '切换浅色主题' : '切换深色主题'"><Icon :name="isDark ? 'sun' : 'moon'" :size="17" /></button></div>
    </div>
  </aside>

  <div class="workspace">
    <header class="topbar">
      <div class="breadcrumb"><button class="icon-button mobile-menu" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="打开导航"><Icon name="menu" /></button><span class="breadcrumb-root">知识库</span><span class="breadcrumb-divider">/</span><span>{{ frontmatter.shortTitle || page.title || '页面' }}</span></div>
      <div class="topbar-actions"><button class="search-trigger" aria-label="搜索论文与笔记" @click="search?.open()"><Icon name="search" :size="17" /><span>搜索论文、概念与笔记</span><kbd>⌘ K</kbd></button><span class="version-tag">V0.1</span></div>
    </header>
    <main id="main-content" class="main-content" tabindex="-1">
      <div v-if="page.isNotFound" class="empty-page"><Icon name="search" :size="40" /><h1>这页笔记还没有收录</h1><p>可以回到论文库，或按关键词搜索已有内容。</p><a class="button primary" :href="withBase('/library.html')">浏览论文库</a></div>
      <Dashboard v-else-if="frontmatter.view === 'home'" />
      <PaperLibrary v-else-if="frontmatter.view === 'library'" :only-saved="frontmatter.saved === true" />
      <ResearchRoutes v-else-if="frontmatter.view === 'routes'" />
      <ReviewCenter v-else-if="frontmatter.view === 'review'" />
      <ArticleView v-else />
      <p v-if="!storageAvailable" class="storage-warning" role="status">当前浏览器无法保存本地记录。收藏与复习操作在本次访问中仍可使用，关闭页面后可能丢失。</p>
    </main>
    <footer class="site-footer"><span>EMBODIED PAPER LIBRARY</span><p>从理解，到判断，再到工程证据。</p><a :href="withBase('/guide.html')">关于这些笔记</a></footer>
  </div>
  <SearchDialog ref="search" />
</template>
