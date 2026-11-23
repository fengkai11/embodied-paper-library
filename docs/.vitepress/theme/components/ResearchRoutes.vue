<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as entries, type Entry } from '../library.data'
import Icon from './Icon.vue'
import PaperFigure from './PaperFigure.vue'

const order = ['industreal', 'td-mpc2', 'hil-serl', 'pi0', 'dino-wm', 'pi05', 'pistar06']
const papers = entries.filter(entry => entry.noteType === 'paper')
  .sort((a, b) => a.year - b.year || order.indexOf(a.slug) - order.indexOf(b.slug))
const threads = [
  { id: 'general-policy', label: '通用策略', color: '#8268c9', question: '从一项技能，走向多任务操作', slugs: ['pi0', 'pi05', 'pistar06'] },
  { id: 'learning-from-experience', label: '从经验中学习', color: '#5c87bd', question: '机器人失败之后，如何做得更好', slugs: ['hil-serl', 'td-mpc2', 'pistar06'] },
  { id: 'world-models', label: '世界模型', color: '#539784', question: '行动之前，能否预测行动的结果', slugs: ['td-mpc2', 'dino-wm'] },
  { id: 'contact-manipulation', label: '接触与装配', color: '#b58a54', question: '从抓住物体，走向可靠的精细操作', slugs: ['industreal', 'hil-serl'] },
]
const mechanisms: Record<string, string> = {
  industreal: '让仿真学到的装配技能走向真实',
  'td-mpc2': '在控制相关的潜空间中预测与规划',
  'hil-serl': '将人的纠正接入真实机器人学习',
  pi0: '把视觉语言先验连接到连续动作',
  'dino-wm': '在视觉特征里预测未来、规划动作',
  pi05: '用异质训练信息扩展环境泛化',
  pistar06: '从经验中估计行为质量、改进策略',
}
const comparisons: Record<string, Array<{ slug: string; label: string }>> = {
  industreal: [{ slug: 'hil-serl', label: '仿真迁移与真实交互：技能从哪里来？' }, { slug: 'dino-wm', label: '装配接触需要怎样的状态信息？' }],
  'td-mpc2': [{ slug: 'dino-wm', label: '控制潜表示与视觉特征，有何不同？' }, { slug: 'hil-serl', label: '模型规划与直接策略，如何用反馈？' }],
  'hil-serl': [{ slug: 'pistar06', label: '专用技能与通用策略，怎样用纠正？' }, { slug: 'industreal', label: '真实交互与仿真迁移，代价是什么？' }],
  pi0: [{ slug: 'pi05', label: '从动作生成，继续追问环境泛化' }, { slug: 'pistar06', label: '有了通用策略，如何从经验中改进？' }],
  'dino-wm': [{ slug: 'td-mpc2', label: '视觉预测与控制预测，目标相同吗？' }, { slug: 'industreal', label: '视觉误差能否刻画精密接触？' }],
  pi05: [{ slug: 'pi0', label: '回看连续动作生成的基础' }, { slug: 'pistar06', label: '泛化之后，继续追问经验学习' }],
  pistar06: [{ slug: 'hil-serl', label: '两种人类纠正，如何进入学习闭环？' }, { slug: 'pi05', label: '泛化能力与持续改进，如何区分？' }],
}
const selectedThread = ref('all')
const selectedSlug = ref('hil-serl')
const detailed = ref(false)
const scroller = ref<HTMLElement>()
const canLeft = ref(false)
const canRight = ref(false)
const activeThread = computed(() => threads.find(t => t.id === selectedThread.value))
const filtered = computed(() => papers.filter(p => !activeThread.value || activeThread.value.slugs.includes(p.slug)))
const groups = computed(() => [...new Set(filtered.value.map(p => p.year))].map(year => {
  const groupPapers = filtered.value.filter(p => p.year === year)
  return { year, papers: groupPapers, columns: Math.ceil(groupPapers.length / 2) }
}))
const singleRow = computed(() => groups.value.every(group => group.papers.length === 1))
const columns = computed(() => groups.value.reduce((sum, group) => sum + group.columns, 0))
const boardWidth = computed(() => Math.max(detailed.value ? 870 : 640, columns.value * (detailed.value ? 310 : 234)))
const selected = computed(() => papers.find(p => p.slug === selectedSlug.value) || filtered.value[0])
const related = computed(() => (comparisons[selected.value?.slug] || []).map(item => ({ ...item, paper: papers.find(p => p.slug === item.slug)! })).filter(item => item.paper))
function color(paper: Entry) { return ({ VLA: '#8268c9', RL: '#5c87bd', '世界模型': '#539784', '精密操作': '#b58a54' } as Record<string, string>)[paper.category] || '#8268c9' }
function saveLocation() {
  const url = new URL(window.location.href)
  url.searchParams.set('paper', selectedSlug.value)
  if (selectedThread.value === 'all') url.searchParams.delete('track')
  else url.searchParams.set('track', selectedThread.value)
  window.history.replaceState(window.history.state, '', url)
}
function choosePaper(slug: string) {
  if (!filtered.value.some(p => p.slug === slug)) selectedThread.value = 'all'
  selectedSlug.value = slug
  saveLocation()
}
function compareWith(slug: string) {
  choosePaper(slug)
  nextTick(() => {
    if (window.matchMedia('(max-width: 680px)').matches) {
      document.getElementById('mobile-card-' + slug)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  })
}
function chooseThread(id: string) {
  selectedThread.value = id
  if (!filtered.value.some(p => p.slug === selectedSlug.value)) selectedSlug.value = filtered.value[0]?.slug || 'hil-serl'
  saveLocation()
  nextTick(() => { scroller.value?.scrollTo({ left: 0 }); updateScroll() })
}
function readLocation() {
  const query = new URLSearchParams(window.location.search)
  selectedThread.value = threads.some(t => t.id === query.get('track')) ? query.get('track')! : 'all'
  const slug = query.get('paper')
  if (slug && filtered.value.some(p => p.slug === slug)) selectedSlug.value = slug
  else if (!filtered.value.some(p => p.slug === selectedSlug.value)) selectedSlug.value = filtered.value[0]?.slug || 'hil-serl'
}
function updateScroll() {
  const el = scroller.value
  if (!el) return
  canLeft.value = el.scrollLeft > 3
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 3
}
function scrollTimeline(direction: number) {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * .72, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
onMounted(() => {
  readLocation()
  nextTick(updateScroll)
  window.addEventListener('resize', updateScroll)
  window.addEventListener('popstate', readLocation)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScroll)
  window.removeEventListener('popstate', readLocation)
})
watch(detailed, () => nextTick(updateScroll))
</script>

<template>
  <div class="visual-timeline-page">
    <header class="timeline-page-heading">
      <div><p class="eyebrow">A VISUAL READING MAP</p><h1>沿着时间，<span>看懂方法的变化。</span></h1><p class="page-subtitle">从一张图想起一篇论文，再沿着问题，找到下一篇。</p></div>
      <div class="timeline-edition"><strong>{{ papers.length }}<span>篇精选</span></strong><span>2023 — 2025</span></div>
    </header>

    <section class="timeline-shell" aria-label="论文图像时间线">
      <div class="timeline-toolbar">
        <div class="timeline-filter" aria-label="按研究线索筛选">
          <button :class="{ active: selectedThread === 'all' }" :aria-pressed="selectedThread === 'all'" @click="chooseThread('all')">全部论文 <span>{{ papers.length }}</span></button>
          <button v-for="thread in threads" :key="thread.id" :class="{ active: selectedThread === thread.id }" :aria-pressed="selectedThread === thread.id" @click="chooseThread(thread.id)"><i :style="{ background: thread.color }"></i>{{ thread.label }}</button>
        </div>
        <div class="timeline-context">
          <p aria-live="polite"><strong>{{ activeThread ? activeThread.question : '七篇论文，四条相互连接的研究线索' }}</strong><span>{{ filtered.length }} 篇 · 点击图片节点展开</span></p>
          <div class="canvas-controls" aria-label="时间线视图控制">
            <div class="size-control"><button :class="{ active: !detailed }" :aria-pressed="!detailed" @click="detailed = false">全览</button><button :class="{ active: detailed }" :aria-pressed="detailed" @click="detailed = true">详看</button></div>
            <button class="canvas-arrow previous" aria-label="向前浏览时间线" :disabled="!canLeft" @click="scrollTimeline(-1)"><Icon name="chevron" :size="16" /></button>
            <button class="canvas-arrow" aria-label="向后浏览时间线" :disabled="!canRight" @click="scrollTimeline(1)"><Icon name="chevron" :size="16" /></button>
          </div>
        </div>
      </div>

      <div ref="scroller" class="timeline-scroller" tabindex="0" aria-label="可横向滚动的论文时间线" @scroll.passive="updateScroll">
        <div class="timeline-board" :class="{ detailed, 'single-row': singleRow }" :style="{ minWidth: boardWidth + 'px' }">
          <section v-for="group in groups" :key="group.year" class="timeline-year" :style="{ flex: group.columns }" :aria-label="`${group.year} 年论文`">
            <h2>{{ group.year }}<span>{{ group.papers.length }} 篇</span></h2>
            <div class="year-nodes" :style="{ gridTemplateColumns: `repeat(${group.columns}, minmax(0, 1fr))` }">
              <div class="year-axis" aria-hidden="true"></div>
              <button v-for="(paper, index) in group.papers" :key="paper.slug" class="image-node" :class="{ selected: selectedSlug === paper.slug, above: index % 2 === 0, below: index % 2 === 1 }" :style="{ gridColumn: Math.floor(index / 2) + 1, gridRow: index % 2 === 0 ? 1 : 3, '--node-color': color(paper) }" :aria-label="`查看 ${paper.shortTitle}：${mechanisms[paper.slug]}`" :aria-pressed="selectedSlug === paper.slug" aria-controls="selected-paper" @click="choosePaper(paper.slug)">
                <span class="node-picture"><img v-if="paper.visual" :src="withBase(paper.visual.image)" :alt="paper.visual.alt" loading="lazy" draggable="false" /><span v-else>{{ paper.shortTitle }}</span><span class="node-selected" v-if="selectedSlug === paper.slug"><Icon name="check" :size="13" />正在看</span></span>
                <span class="node-title"><strong>{{ paper.shortTitle }}</strong><span>{{ paper.category }}</span></span>
                <span class="node-mechanism">{{ mechanisms[paper.slug] || paper.takeaway }}</span>
                <span class="node-dot" aria-hidden="true"></span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <div class="mobile-timeline">
        <section v-for="group in groups" :key="group.year" class="mobile-year">
          <h2>{{ group.year }}<span>{{ group.papers.length }} 篇论文</span></h2>
          <article v-for="paper in group.papers" :key="paper.slug" :id="`mobile-card-${paper.slug}`" class="mobile-paper" :class="{ selected: selectedSlug === paper.slug }" :style="{ '--node-color': color(paper) }">
            <button class="mobile-paper-trigger" :aria-expanded="selectedSlug === paper.slug" :aria-controls="`mobile-detail-${paper.slug}`" @click="choosePaper(paper.slug)">
              <img v-if="paper.visual" :src="withBase(paper.visual.image)" :alt="paper.visual.alt" loading="lazy" />
              <span class="mobile-paper-caption"><span class="node-title"><strong>{{ paper.shortTitle }}</strong><span>{{ paper.category }}</span></span><span class="node-mechanism">{{ mechanisms[paper.slug] || paper.takeaway }}</span><span class="mobile-expand-label">{{ selectedSlug === paper.slug ? '正在看 · 图解与阅读入口' : '展开图解与阅读入口' }}<Icon :name="selectedSlug === paper.slug ? 'check' : 'chevron'" :size="15" /></span></span>
            </button>
            <div v-if="selectedSlug === paper.slug" :id="`mobile-detail-${paper.slug}`" class="mobile-paper-detail">
              <span class="insight-label">核心问题</span><h3>{{ paper.question }}</h3>
              <span class="insight-label">机制速记</span><p>{{ paper.takeaway }}</p>
              <div v-if="paper.visual" class="mobile-image-source"><p>{{ paper.visual.caption }}</p><a :href="withBase(paper.visual.image)" target="_blank" rel="noopener noreferrer">查看完整图片 <Icon name="external" :size="13" /></a><a :href="paper.visual.sourcePage" target="_blank" rel="noopener noreferrer">图片来源</a></div>
              <div class="insight-actions"><a class="button primary" :href="withBase(paper.url)">进入精读笔记 <Icon name="chevron" :size="15" /></a><a :href="paper.source" target="_blank" rel="noopener noreferrer">论文原文 <Icon name="external" :size="13" /></a></div>
              <div class="mobile-related"><span class="insight-label">接着比较</span><button v-for="item in related" :key="item.slug" @click="compareWith(item.slug)">{{ item.paper.shortTitle }}<span>{{ item.label }}</span><Icon name="chevron" :size="15" /></button></div>
            </div>
          </article>
        </section>
      </div>

      <footer class="timeline-caption"><span><Icon name="clock" :size="14" />按首个公开版本年份分组，间距为阅读布局。</span><a class="desktop-hint detail-jump" href="#selected-paper">查看 {{ selected?.shortTitle }} 图解 <Icon name="chevron" :size="13" /></a></footer>
    </section>

    <section v-if="selected" id="selected-paper" class="selected-paper" aria-labelledby="selected-paper-heading">
      <div class="selected-heading"><div><span class="detail-overline">SELECTED PAPER</span><h2 id="selected-paper-heading">{{ selected.shortTitle }} <span>{{ selected.year }} · {{ selected.category }}</span></h2></div><span class="draft-label">{{ selected.status }}</span></div>
      <div class="selected-body">
        <PaperFigure v-if="selected.visual" :key="selected.slug" :visual="selected.visual" :title="selected.shortTitle" class="timeline-figure" />
        <div class="paper-insight"><span class="insight-label">核心问题</span><h3>{{ selected.question }}</h3><span class="insight-label">机制速记</span><p>{{ selected.takeaway }}</p><div class="insight-actions"><a class="button primary" :href="withBase(selected.url)">进入精读笔记 <Icon name="chevron" :size="15" /></a><a :href="selected.source" target="_blank" rel="noopener noreferrer">论文原文 <Icon name="external" :size="13" /></a></div><div class="comparison-links"><span class="insight-label">接着比较</span><button v-for="item in related" :key="item.slug" @click="compareWith(item.slug)"><strong>{{ item.paper.shortTitle }}</strong><span>{{ item.label }}</span><Icon name="chevron" :size="15" /></button></div></div>
      </div>
      <p class="relation-note">关联阅读围绕共同问题展开，不表示已经证实的引用或技术继承关系。</p>
    </section>
    <p class="sr-only" aria-live="polite">已选择 {{ selected?.shortTitle }}，可查看图片、机制与精读入口。</p>
    <div class="timeline-closing"><Icon name="book" :size="18" /><p>先读懂几篇，再慢慢把线连起来。</p><a :href="withBase('/library.html')">回到论文库 <Icon name="chevron" :size="15" /></a></div>
  </div>
</template>

<style scoped>
.visual-timeline-page{min-width:0}.timeline-page-heading{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:28px}.timeline-page-heading h1{font-size:clamp(25px,2.5vw,35px);font-weight:650;line-height:1.45;letter-spacing:-.7px}.timeline-page-heading h1>span{display:inline-block}.timeline-page-heading .eyebrow{color:var(--accent);font-size:11px;letter-spacing:1.7px;margin-bottom:12px}.timeline-page-heading .page-subtitle{font-size:15px}.timeline-edition{display:flex;flex-direction:column;gap:6px;white-space:nowrap;text-align:right}.timeline-edition strong{font-size:29px;font-weight:550;color:var(--accent)}.timeline-edition strong span{font-size:12px;color:var(--muted);margin-left:8px}.timeline-edition>span{font-size:11px;letter-spacing:1.5px;color:var(--muted)}
.timeline-shell{border:1px solid var(--border);border-radius:15px;background:var(--surface);overflow:hidden;box-shadow:var(--shadow)}.timeline-toolbar{padding:18px 22px 16px}.timeline-filter{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.timeline-filter button{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid transparent;border-radius:7px;padding:9px 12px;font-size:13px;color:var(--muted);min-height:39px;white-space:nowrap}.timeline-filter button:hover{background:var(--bg);color:var(--text)}.timeline-filter button.active{background:var(--accent-light);color:var(--accent);border-color:color-mix(in srgb,var(--accent),transparent 78%)}.timeline-filter button>i{display:inline-block;width:6px;height:6px;border-radius:50%}.timeline-filter button>span{font-size:11px;padding:1px 5px;background:var(--surface);border-radius:4px}.timeline-context{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-top:18px;padding-top:17px;border-top:1px solid var(--border)}.timeline-context p{display:flex;gap:5px;flex-direction:column;font-size:13px;line-height:1.6}.timeline-context strong{font-weight:500;color:var(--text)}.timeline-context p>span{font-size:12px;color:var(--muted)}.canvas-controls{display:flex;align-items:center;gap:7px;flex-shrink:0}.size-control{display:flex;background:var(--bg);border:1px solid var(--border);padding:3px;border-radius:7px;margin-right:4px}.size-control button{padding:5px 11px;font-size:12px;border-radius:4px;min-height:29px;color:var(--muted)}.size-control button.active{background:var(--surface);color:var(--accent);box-shadow:0 1px 3px #1d213010}.canvas-arrow{border:1px solid var(--border);border-radius:7px;width:33px;height:37px;display:grid;place-items:center}.canvas-arrow.previous svg{transform:rotate(180deg)}.canvas-arrow:disabled{opacity:.28}.canvas-arrow:not(:disabled):hover{border-color:var(--accent);color:var(--accent)}
.timeline-scroller{overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:#b6b0cd transparent;background-color:var(--bg);background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:24px 24px;border-top:1px solid var(--border);padding:18px 20px 25px}.timeline-scroller:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}.timeline-board{width:100%;display:flex;gap:22px}.timeline-year{min-width:0}.timeline-year h2{font-size:21px;font-weight:550;letter-spacing:-.7px;display:flex;gap:9px;align-items:baseline;padding-bottom:15px}.timeline-year h2>span{font-size:11px;font-weight:400;color:var(--muted);letter-spacing:0}.year-nodes{display:grid;grid-template-rows:216px 54px 216px;column-gap:22px;position:relative}.year-axis{position:absolute;left:-12px;right:-12px;top:242px;height:1px;background:#a6a4b5}.year-axis::after{content:'';position:absolute;top:-3px;left:4px;width:7px;height:7px;border-radius:50%;background:#a6a4b5}.image-node{position:relative;min-width:0;display:flex;flex-direction:column;padding:9px;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:10px;transition:border-color .18s,box-shadow .18s;box-shadow:0 3px 12px #23233105}.image-node:hover{border-color:var(--node-color);box-shadow:0 4px 17px #30273f10}.image-node.selected{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent),transparent 78%)}.node-picture{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:111px;flex-shrink:0;border-radius:5px;overflow:hidden;background:#f4f4f2}.node-picture>img{width:100%;height:100%;object-fit:contain}.node-selected{position:absolute;right:5px;bottom:5px;display:flex;align-items:center;gap:3px;background:#6657ce;color:#fff;padding:3px 5px;border-radius:4px;font-size:10px;box-shadow:0 2px 8px #0002}.node-title{display:flex;align-items:baseline;gap:8px;justify-content:space-between;margin-top:11px;color:var(--text)}.node-title strong{font-size:17px;font-weight:600;line-height:1.4}.node-title>span{font-size:10px;white-space:nowrap;color:var(--node-color)}.node-mechanism{display:block;font-size:12px;line-height:1.7;color:var(--muted);margin-top:6px;text-wrap:pretty}.image-node::after{position:absolute;content:'';width:1px;height:27px;background:var(--node-color);left:24px}.image-node.above::after{bottom:-28px}.image-node.below::after{top:-28px}.node-dot{position:absolute;left:20px;width:9px;height:9px;border-radius:50%;background:var(--node-color);box-shadow:0 0 0 4px var(--bg);z-index:1}.above .node-dot{bottom:-32px}.below .node-dot{top:-32px}.image-node.selected .node-dot{background:var(--accent);box-shadow:0 0 0 4px var(--accent-light)}.detailed .year-nodes{grid-template-rows:258px 54px 258px}.detailed .year-axis{top:284px}.single-row .year-nodes{grid-template-rows:216px 30px}.single-row.detailed .year-nodes{grid-template-rows:258px 30px}.detailed .node-picture{height:149px}.detailed .node-title strong{font-size:19px}.detailed .node-mechanism{font-size:14px}.timeline-caption{display:flex;justify-content:space-between;gap:15px;padding:14px 22px;color:var(--muted);font-size:11px;line-height:1.8}.timeline-caption>span:first-child{display:flex;align-items:center;gap:6px}.desktop-hint{white-space:nowrap}.detail-jump{display:flex;align-items:center;gap:4px;color:var(--accent);font-size:12px}.detail-jump svg{transform:rotate(90deg)}
.selected-paper{margin-top:25px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:25px;scroll-margin-top:92px}.selected-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:21px}.detail-overline{font-size:10px;letter-spacing:1.5px;color:var(--accent)}.selected-heading h2{font-size:25px;font-weight:600;margin-top:7px}.selected-heading h2>span{font-size:12px;color:var(--muted);font-weight:400;letter-spacing:0;margin-left:10px}.selected-body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:28px;align-items:start}.timeline-figure{--paper-figure-height:290px;margin:0!important}.paper-insight{min-width:0}.insight-label{display:block;font-size:11px;color:var(--muted);margin-bottom:7px;letter-spacing:.6px}.paper-insight h3,.mobile-paper-detail h3{font-size:18px;font-weight:550;line-height:1.8;margin-bottom:21px}.paper-insight>p,.mobile-paper-detail>p{font-size:14px;line-height:1.9;color:var(--muted)}.insight-actions{display:flex;align-items:center;gap:17px;margin-top:19px;flex-wrap:wrap}.insight-actions .button{font-size:13px;min-height:40px;padding-left:14px;padding-right:12px}.insight-actions>a:not(.button){display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--muted)}.comparison-links{margin-top:23px;padding-top:16px;border-top:1px solid var(--border)}.comparison-links>button{display:grid;grid-template-columns:69px minmax(0,1fr) 15px;gap:9px;align-items:center;text-align:left;width:100%;padding:9px 0;color:var(--muted)}.comparison-links>button:hover{color:var(--accent)}.comparison-links strong{font-weight:550;font-size:12px;color:var(--accent)}.comparison-links button>span{font-size:12px;line-height:1.65}.relation-note{border-top:1px solid var(--border);padding-top:15px;margin-top:23px;font-size:11px;color:var(--muted);line-height:1.8}.timeline-closing{display:flex;align-items:center;gap:9px;padding-top:26px;color:var(--muted);font-size:12px;line-height:1.8}.timeline-closing>a{margin-left:auto;white-space:nowrap;display:flex;align-items:center;gap:3px;color:var(--accent)}.mobile-timeline{display:none}
@media(max-width:1100px){.timeline-toolbar{padding-left:17px;padding-right:17px}.timeline-filter{gap:3px}.timeline-filter button{padding-left:9px;padding-right:9px;font-size:12px}.timeline-page-heading .page-subtitle{font-size:14px}.selected-body{gap:21px}.selected-paper{padding:22px}.timeline-figure{--paper-figure-height:250px}.paper-insight h3{font-size:17px}.comparison-links>button{grid-template-columns:64px minmax(0,1fr) 15px;gap:7px}}
@media(max-width:900px){.timeline-edition{display:none}.selected-body{grid-template-columns:minmax(0,1fr)}.timeline-figure{--paper-figure-height:300px}.timeline-context{gap:12px}.timeline-context strong{max-width:290px}.comparison-links>button{grid-template-columns:80px minmax(0,1fr) 15px}}
@media(max-width:680px){.timeline-page-heading{margin-bottom:23px}.timeline-page-heading h1{font-size:27px;max-width:330px;line-height:1.55}.timeline-page-heading .page-subtitle{font-size:14px;max-width:320px}.timeline-toolbar{padding:15px 15px 18px}.timeline-filter{gap:5px}.timeline-filter button{padding:8px 10px;min-height:37px;font-size:12px}.timeline-context{margin-top:14px;padding-top:14px}.timeline-context strong{font-size:13px;max-width:none}.timeline-context p>span{font-size:11px}.canvas-controls,.timeline-scroller,.selected-paper,.desktop-hint{display:none}.mobile-timeline{display:block;border-top:1px solid var(--border);padding:23px 15px 8px;background:var(--bg)}.mobile-year{padding-left:14px;border-left:1px solid var(--border);margin-left:2px;position:relative;padding-bottom:22px}.mobile-year h2{font-size:21px;font-weight:550;display:flex;align-items:center;gap:10px;margin:0 0 15px}.mobile-year h2::before{content:'';position:absolute;left:-4px;top:12px;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--bg)}.mobile-year h2>span{font-size:11px;color:var(--muted);font-weight:400}.mobile-paper{scroll-margin-top:80px;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px;min-width:0}.mobile-paper.selected{border-color:var(--accent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent),transparent 65%)}.mobile-paper-trigger{display:block;width:100%;padding:0;text-align:left}.mobile-paper-trigger>img{display:block;width:100%;height:158px;object-fit:contain;background:#f4f4f2;border-bottom:1px solid var(--border)}.mobile-paper-caption{display:block;padding:5px 14px 13px}.mobile-paper .node-title strong{font-size:19px}.mobile-paper .node-title>span{font-size:11px}.mobile-paper .node-mechanism{font-size:13px;line-height:1.75;margin-top:7px}.mobile-expand-label{display:flex;justify-content:space-between;align-items:center;color:var(--accent);font-size:11px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)}.mobile-paper-detail{padding:17px 14px;border-top:1px solid var(--border)}.mobile-paper-detail h3{font-size:16px;margin-bottom:18px}.mobile-paper-detail>p{font-size:13px}.mobile-image-source{font-size:11px;line-height:1.8;color:var(--muted);margin-top:15px}.mobile-image-source>p{margin-bottom:6px}.mobile-image-source>a{display:inline-flex;align-items:center;gap:4px;color:var(--accent);margin-right:14px;padding:5px 0}.mobile-paper-detail .insight-actions{gap:14px}.mobile-related{padding-top:15px;margin-top:18px;border-top:1px solid var(--border)}.mobile-related>button{display:grid;grid-template-columns:minmax(0,1fr) 15px;text-align:left;width:100%;font-size:13px;gap:4px 8px;color:var(--accent);padding:9px 0}.mobile-related button>span{grid-row:2;grid-column:1;font-size:12px;line-height:1.7;color:var(--muted)}.mobile-related button>svg{grid-column:2;grid-row:1/3;align-self:center}.timeline-caption{padding:13px 15px;font-size:10px}.timeline-caption>span:first-child{align-items:flex-start}.timeline-caption svg{margin-top:2px;flex-shrink:0}.timeline-closing{flex-wrap:wrap;gap:6px;font-size:12px;padding-top:23px}.timeline-closing>a{width:100%;margin:7px 0 0 25px}.timeline-shell{border-radius:12px}}
@media(prefers-reduced-motion:reduce){.image-node{transition:none}}
</style>
