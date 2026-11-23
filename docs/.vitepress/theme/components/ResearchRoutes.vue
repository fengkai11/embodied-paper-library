<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../library.data'
import Icon from './Icon.vue'

type Paper = {
  slug: string
  title: string
  shortTitle?: string
  description?: string
  year: string | number
  category?: string
  tags?: string[]
  status?: string
  question?: string
  noteType: string
}
type Route = {
  id: string
  label: string
  question: string
  description: string
  terms: string[]
  slugs: string[]
}

const papers = computed(() => (entries as Paper[]).filter(entry => entry.noteType === 'paper'))
const selectedRoute = ref('all')
const routes: Route[] = [
  {
    id: 'general-policy',
    label: '通用策略',
    question: '从一项技能，走向多任务操作',
    description: '动作如何表示？语义先验与多源数据，怎样支持任务和场景泛化？',
    terms: ['vla', '通用策略', '通用操作'],
    slugs: ['pi0', 'pi05', 'pistar06'],
  },
  {
    id: 'learning-from-experience',
    label: '从经验中学习',
    question: '机器人失败之后，如何做得更好',
    description: '把示范、干预和任务反馈接入学习，追问价值信号如何改变策略。',
    terms: ['强化学习', 'rl', '经验学习'],
    slugs: ['hil-serl', 'td-mpc2', 'pistar06'],
  },
  {
    id: 'world-models',
    label: '世界模型',
    question: '行动之前，能否预测行动的结果',
    description: '比较控制相关潜表示与视觉特征预测，以及它们为规划提供的信息。',
    terms: ['世界模型', 'world model', 'world-model'],
    slugs: ['td-mpc2', 'dino-wm'],
  },
  {
    id: 'contact-manipulation',
    label: '接触与装配',
    question: '从抓住物体，走向可靠的精细操作',
    description: '关注接触误差、仿真迁移、闭环纠正，以及失败后的恢复。',
    terms: ['装配', '接触', '精密', 'sim-to-real'],
    slugs: ['industreal', 'hil-serl'],
  },
]

function belongsToRoute(paper: Paper, route: Route) {
  if (route.slugs.includes(paper.slug)) return true
  const labels = [paper.category ?? '', ...(paper.tags ?? [])].map(label => label.toLowerCase())
  return route.terms.some(term => labels.some(label => label === term || ((term.length > 3 || /[\u3400-\u9fff]/.test(term)) && label.includes(term))))
}

const activeRoute = computed(() => routes.find(route => route.id === selectedRoute.value))
const filteredPapers = computed(() => {
  const route = activeRoute.value
  return papers.value
    .filter(paper => !route || belongsToRoute(paper, route))
    .slice()
    .sort((a, b) => Number(a.year) - Number(b.year) || a.title.localeCompare(b.title))
})
const timeline = computed(() => {
  const groups = new Map<string, Paper[]>()
  for (const paper of filteredPapers.value) {
    const year = String(paper.year || '年份待补充')
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(paper)
  }
  return Array.from(groups, ([year, papers]) => ({ year, papers }))
})
function routeCount(route: Route) {
  return papers.value.filter(paper => belongsToRoute(paper, route)).length
}
</script>

<template>
  <div class="routes-page">
    <header class="page-heading">
      <div class="eyebrow"><Icon name="map" /> RESEARCH ROUTES</div>
      <h1>沿着问题，串起论文</h1>
      <p>先找到你正在追问的问题，再看不同方法如何作答。</p>
    </header>

    <section aria-labelledby="route-selection-heading">
      <div class="section-heading">
        <h2 id="route-selection-heading">四条研究线索</h2>
        <span>同一篇论文可以属于多条路线</span>
      </div>
      <div class="route-grid" aria-label="按研究路线筛选">
        <button
          v-for="route in routes"
          :key="route.id"
          class="route-card"
          :class="{ selected: selectedRoute === route.id }"
          :aria-pressed="selectedRoute === route.id"
          aria-controls="paper-timeline"
          @click="selectedRoute = selectedRoute === route.id ? 'all' : route.id"
        >
          <span class="route-topline">
            <span class="route-label">{{ route.label }}</span>
            <span class="route-count">{{ routeCount(route) }} 篇</span>
          </span>
          <strong>{{ route.question }}</strong>
          <span class="route-description">{{ route.description }}</span>
          <span class="route-action">
            <span>{{ selectedRoute === route.id ? '已选择此路线' : '查看这条路线' }}</span>
            <Icon v-if="selectedRoute === route.id" name="check" />
          </span>
        </button>
      </div>
    </section>

    <section id="paper-timeline" class="timeline-section" aria-labelledby="timeline-heading">
      <div class="timeline-heading">
        <div>
          <h2 id="timeline-heading">{{ activeRoute ? activeRoute.label : '全部研究路线' }}</h2>
          <p aria-live="polite">{{ filteredPapers.length }} 篇论文 · 按论文索引中的年份排列</p>
        </div>
        <button v-if="activeRoute" class="reset-button" @click="selectedRoute = 'all'">
          <Icon name="close" /> 显示全部
        </button>
      </div>
      <div class="reading-note">
        <Icon name="book" />
        <p>这是一份按问题组织的阅读导航。时间先后与问题关联，并不代表论文间存在引用或技术继承关系。</p>
      </div>

      <div v-if="timeline.length" class="timeline">
        <section v-for="group in timeline" :key="group.year" class="year-group" :aria-label="`${group.year} 年论文`">
          <div class="year-label"><span>{{ group.year }}</span></div>
          <div class="year-papers">
            <a
              v-for="paper in group.papers"
              :key="paper.slug"
              :href="withBase('/papers/' + paper.slug + '.html')"
              class="timeline-paper"
            >
              <div class="paper-meta">
                <span>{{ paper.category || '研究论文' }}</span>
                <span v-if="paper.status" class="paper-status">{{ paper.status }}</span>
              </div>
              <h3>{{ paper.shortTitle || paper.title }}</h3>
              <p>{{ paper.question || paper.description }}</p>
              <div v-if="paper.tags?.length" class="paper-tags">
                <span v-for="tag in paper.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
              </div>
            </a>
          </div>
        </section>
      </div>
      <div v-else class="empty-state">
        <Icon name="book" />
        <h3>这条路线还没有论文笔记</h3>
        <p>换一条研究路线，或先浏览全部已收录论文。</p>
        <button class="reset-button" @click="selectedRoute = 'all'">查看全部论文</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.routes-page { color: var(--text, #20242c); }
.page-heading { margin-bottom: 34px; }
.eyebrow { display: flex; align-items: center; gap: 9px; color: var(--accent, #5d51c9); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.eyebrow :deep(svg) { width: 17px; height: 17px; }
h1 { margin: 14px 0 10px; font-size: clamp(28px, 3.1vw, 38px); line-height: 1.35; font-weight: 700; letter-spacing: -.035em; }
.page-heading > p { margin: 0; color: var(--muted, #6c7381); line-height: 1.8; font-size: 16px; }
.section-heading, .timeline-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
h2 { margin: 0; padding: 0; border: 0; font-size: 19px; line-height: 1.5; font-weight: 650; }
.section-heading > span { color: var(--muted, #6c7381); font-size: 13px; }
.route-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
.route-card { display: flex; flex-direction: column; align-items: stretch; min-width: 0; padding: 23px 24px 18px; text-align: left; font: inherit; color: inherit; background: var(--surface, #fff); border: 1px solid var(--border, #e6e8ee); border-radius: 14px; cursor: pointer; transition: border-color .16s ease, background .16s ease; }
.route-card:hover { border-color: var(--accent, #5d51c9); }
.route-card.selected { border-color: var(--accent, #5d51c9); background: var(--accent-light, #efedfb); box-shadow: inset 0 0 0 1px var(--accent, #5d51c9); }
.route-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.route-label { color: var(--accent, #5d51c9); font-size: 14px; font-weight: 650; }
.route-count { color: var(--muted, #6c7381); font-size: 13px; white-space: nowrap; }
.route-card strong { margin-top: 14px; font-size: 18px; line-height: 1.6; font-weight: 650; }
.route-description { display: block; margin-top: 8px; color: var(--muted, #6c7381); font-size: 14px; line-height: 1.85; }
.route-action { display: flex; align-items: center; justify-content: space-between; min-height: 43px; margin-top: 17px; padding-top: 13px; border-top: 1px solid var(--border, #e6e8ee); font-size: 13px; font-weight: 600; color: var(--accent, #5d51c9); }
.route-action :deep(svg) { width: 17px; height: 17px; }
.timeline-section { margin-top: 40px; scroll-margin-top: 24px; }
.timeline-heading p { margin: 6px 0 0; color: var(--muted, #6c7381); font-size: 14px; }
.reset-button { display: inline-flex; gap: 7px; align-items: center; justify-content: center; min-height: 40px; padding: 8px 13px; background: var(--surface, #fff); border: 1px solid var(--border, #e6e8ee); border-radius: 8px; color: var(--text, #20242c); font: inherit; font-size: 14px; cursor: pointer; white-space: nowrap; }
.reset-button:hover { border-color: var(--accent, #5d51c9); color: var(--accent, #5d51c9); }
.reset-button :deep(svg) { width: 15px; height: 15px; }
.reading-note { display: flex; gap: 10px; align-items: flex-start; margin-top: 20px; color: var(--muted, #6c7381); }
.reading-note > :deep(svg) { width: 17px; height: 17px; flex: 0 0 17px; margin-top: 4px; }
.reading-note p { margin: 0; font-size: 13px; line-height: 1.8; }
.timeline { margin-top: 27px; }
.year-group { position: relative; display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 24px; padding-bottom: 24px; }
.year-group::before { content: ''; position: absolute; left: 75px; top: 13px; bottom: -13px; width: 1px; background: var(--border, #e6e8ee); }
.year-group:last-child::before { bottom: 24px; }
.year-label { position: relative; padding-top: 14px; font-size: 17px; font-weight: 650; font-variant-numeric: tabular-nums; }
.year-label::after { content: ''; position: absolute; top: 22px; right: -4px; width: 7px; height: 7px; background: var(--accent, #5d51c9); border: 3px solid var(--bg, #f6f7fa); border-radius: 50%; }
.year-papers { display: grid; gap: 12px; }
.timeline-paper { display: block; padding: 20px 23px; border: 1px solid var(--border, #e6e8ee); border-radius: 12px; color: inherit; background: var(--surface, #fff); text-decoration: none; transition: border-color .16s ease; }
.timeline-paper:hover { border-color: var(--accent, #5d51c9); }
.paper-meta { display: flex; align-items: center; gap: 12px; color: var(--muted, #6c7381); font-size: 12px; }
.paper-status { padding: 2px 7px; border: 1px solid var(--border, #e6e8ee); border-radius: 5px; font-size: 12px; }
.timeline-paper h3 { margin: 9px 0 5px; font-size: 18px; line-height: 1.55; font-weight: 650; }
.timeline-paper p { margin: 0; color: var(--muted, #6c7381); font-size: 14px; line-height: 1.8; }
.paper-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
.paper-tags span { padding: 3px 8px; background: var(--bg, #f6f7fa); border-radius: 5px; color: var(--muted, #6c7381); font-size: 12px; line-height: 1.5; }
.empty-state { display: grid; justify-items: center; padding: 48px 24px; margin-top: 24px; text-align: center; background: var(--surface, #fff); border: 1px dashed var(--border, #e6e8ee); border-radius: 12px; }
.empty-state > :deep(svg) { width: 28px; height: 28px; color: var(--muted, #6c7381); }
.empty-state h3 { margin: 14px 0 6px; font-size: 17px; }
.empty-state p { margin: 0 0 18px; color: var(--muted, #6c7381); font-size: 14px; }
button:focus-visible, a:focus-visible { outline: 3px solid var(--accent, #5d51c9); outline-offset: 4px; }
@media (max-width: 760px) {
  .page-heading { margin-bottom: 26px; }
  .route-grid { gap: 12px; }
  .route-card { padding: 19px 18px 15px; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: 4px; }
  .route-card strong { font-size: 17px; }
  .timeline-section { margin-top: 30px; }
}
@media (max-width: 520px) {
  .route-grid { grid-template-columns: minmax(0, 1fr); }
  .route-card { padding: 19px 20px 14px; }
  .route-card strong { margin-top: 9px; }
  .route-action { margin-top: 12px; }
  .timeline-heading { align-items: flex-start; }
  .timeline-heading h2 { font-size: 18px; }
  .year-group { grid-template-columns: minmax(0, 1fr); gap: 12px; padding-bottom: 22px; }
  .year-group::before, .year-label::after { display: none; }
  .year-label { padding-top: 0; }
  .timeline-paper { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .route-card, .timeline-paper { transition: none; }
}
</style>
