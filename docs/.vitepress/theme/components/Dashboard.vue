<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../library.data'
import { history } from '../state'
import Icon from './Icon.vue'
import PaperLibrary from './PaperLibrary.vue'
const papers = entries.filter(e => e.noteType === 'paper')
const featured = computed(() => papers.find(p => p.slug === history.value[0]?.slug) || papers.find(p => p.slug === 'pistar06') || papers[0])
const resumed = computed(() => papers.some(paper => paper.slug === history.value[0]?.slug))
const failedImages = ref<Record<string, boolean>>({})
const timelinePreview = computed(() => ['industreal', 'dino-wm', 'pistar06']
  .map(slug => papers.find(paper => paper.slug === slug))
  .filter((paper): paper is (typeof papers)[number] => Boolean(paper)))
const relatedDestination = computed(() => {
  if (featured.value?.slug === 'industreal') return { url: '/topics/precision-assembly.html', label: '查看装配专题' }
  if (['pistar06', 'hil-serl', 'td-mpc2'].includes(featured.value?.slug)) return { url: '/topics/learning-from-experience.html', label: '查看关联专题' }
  return { url: '/routes.html', label: '探索研究路线' }
})
const categories = new Set(papers.map(p => p.category))
const topics = entries.filter(e => e.noteType === 'topic')
</script>

<template>
  <div class="page-heading home-heading"><div><p class="eyebrow">A GROWING RESEARCH NOTEBOOK</p><h1>让知识，彼此连接。</h1><p class="page-subtitle">读懂方法背后的问题，把每一次精读变成可回看的研究积累。</p></div><span class="edition-label"><span class="edition-dot"></span>个人研究知识库</span></div>

  <section class="hero-grid visual-hero" aria-label="阅读与图像时间线入口">
    <div class="focus-card" v-if="featured">
      <div class="focus-copy">
        <span class="focus-kicker"><Icon name="book" :size="16" />{{ resumed ? '最近浏览 · 继续思考' : '从这里开始 · 经验驱动的学习' }}</span>
        <div class="focus-title-line"><h2>{{ featured.shortTitle }}</h2><span>{{ featured.year }} · {{ featured.category }}</span></div>
        <p class="focus-question">{{ featured.question }}</p>
      </div>
      <figure class="focus-figure">
        <a class="focus-image-link" :href="withBase(featured.url)" :aria-label="`打开 ${featured.shortTitle} 精读笔记`">
          <img v-if="featured.visual?.image && !failedImages[featured.slug]" :src="withBase(featured.visual.image)" :alt="featured.visual.alt || `${featured.shortTitle} 论文图像`" width="720" height="300" fetchpriority="high" decoding="async" @error="failedImages[featured.slug] = true" />
          <span v-else class="image-placeholder"><Icon name="book" :size="28" /><span>{{ featured.shortTitle }} · 精读笔记</span></span>
        </a>
        <figcaption v-if="featured.visual?.image && !failedImages[featured.slug]">
          <span v-if="featured.visual.caption">{{ featured.visual.caption }}</span>
          <a v-if="featured.visual.sourcePage" :href="featured.visual.sourcePage" target="_blank" rel="noreferrer">图像来源<Icon name="external" :size="13" /></a>
        </figcaption>
      </figure>
      <div class="focus-bottom"><p class="focus-description">{{ featured.takeaway }}</p><div class="focus-actions"><a class="button primary" :href="withBase(featured.url)">进入精读笔记</a><a class="text-button" :href="withBase(relatedDestination.url)">{{ relatedDestination.label }}</a></div></div>
    </div>

    <a class="timeline-entry" :href="withBase('/routes.html')" :aria-label="`打开图像时间线，浏览 ${papers.length} 篇论文的研究路线`">
      <div class="timeline-entry-heading"><span class="section-kicker"><Icon name="map" :size="17" />按图回看 · 沿问题探索</span><h2>图像时间线</h2><p>看见方法，再连接它们背后的问题。</p></div>
      <div class="timeline-preview">
        <div v-for="paper in timelinePreview" :key="paper.slug" class="timeline-preview-row">
          <span class="preview-year">{{ paper.year }}</span>
          <span class="preview-figure"><img v-if="paper.visual?.image && !failedImages[paper.slug]" :src="withBase(paper.visual.image)" :alt="paper.visual.alt || `${paper.shortTitle} 论文图像`" width="160" height="100" loading="lazy" decoding="async" @error="failedImages[paper.slug] = true" /><Icon v-else name="book" :size="23" /></span>
          <span class="preview-paper"><strong>{{ paper.shortTitle }}</strong><span>{{ paper.category }}</span></span>
        </div>
      </div>
      <div class="timeline-entry-footer"><span>探索 {{ papers.length }} 篇论文的图像线索</span><Icon name="map" :size="18" /></div>
      <p class="timeline-entry-note">按年份串联，点击节点展开论文图与机制。</p>
    </a>
  </section>

  <div class="collection-strip"><span><Icon name="book" :size="17" /><strong>{{ papers.length }}</strong> 篇收录笔记</span><i></i><span><Icon name="map" :size="17" /><strong>{{ categories.size }}</strong> 条研究路线</span><i></i><span><Icon name="layers" :size="17" /><strong>{{ topics.length }}</strong> 个比较专题</span><span class="collection-note">首批内容为速览草稿，待逐篇精读校对</span></div>

  <div class="dashboard-columns">
    <section class="dashboard-library"><PaperLibrary compact /></section>
    <aside class="research-rail">
      <div class="rail-heading"><h2>把论文连起来</h2><span>RESEARCH THREADS</span></div>
      <a class="thread-card" :href="withBase('/topics/learning-from-experience.html')"><span class="thread-icon purple"><Icon name="layers" /></span><span class="thread-label">VLA × REINFORCEMENT LEARNING</span><h3>机器人如何从经验中进步？</h3><p>HIL-SERL、π*₀.₆ 与 TD-MPC2<br>三种反馈闭环，同一个问题。</p><span class="thread-footer">阅读专题 <Icon name="chevron" :size="16" /></span></a>
      <a class="thread-card" :href="withBase('/topics/precision-assembly.html')"><span class="thread-icon teal"><Icon name="flask" /></span><span class="thread-label">CONTACT-RICH MANIPULATION</span><h3>从抓住物体，到精密装配</h3><p>接触、位姿误差与失败恢复，<br>如何转化成可验证的实验？</p><span class="thread-footer">打开研究线索 <Icon name="chevron" :size="16" /></span></a>
      <div class="review-prompt"><span class="section-kicker"><Icon name="repeat" :size="17" />一次小复习</span><h3>先不看笔记，你能说清<br>RL 为什么能超过 BC 吗？</h3><a :href="withBase('/review.html')">试着回答 <Icon name="chevron" :size="16" /></a></div>
    </aside>
  </div>
  <section class="bottom-note"><span class="bottom-note-icon"><Icon name="file" :size="22" /></span><div><h2>让下一篇论文，也有清晰的起点。</h2><p>统一精读模板：问题、机制、公式、证据、局限，以及你的下一步实验。</p></div><a class="button secondary" :href="withBase('/templates/paper.html')">查看精读模板</a></section>
</template>

<style scoped>
.visual-hero { grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr); align-items: stretch; }
.focus-card { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--surface, #fff); border-color: var(--border, #e6e8ee); }
.focus-copy { flex: none; padding: 25px 27px 19px; }
.focus-kicker { color: var(--accent, #5d51c9); font-size: 13px; line-height: 1.6; }
.focus-title-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 15px; margin-top: 15px; }
.focus-copy h2 { margin: 0; font-size: 30px; line-height: 1.3; color: var(--text, #20242c); }
.focus-title-line > span { font-size: 12px; color: var(--muted, #6c7381); white-space: nowrap; }
.focus-question { max-width: none; margin: 10px 0 0; color: var(--text, #20242c); font-size: 17px; line-height: 1.65; font-weight: 500; }
.focus-figure { margin: 0 27px; min-width: 0; }
.focus-image-link { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; height: clamp(180px, 16vw, 245px); overflow: hidden; background: #fff; border: 1px solid var(--border, #e6e8ee); border-radius: 9px; }
.focus-image-link img { display: block; box-sizing: border-box; min-width: 0; min-height: 0; width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; padding: 12px; }
.image-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #757181; font-size: 14px; }
.focus-figure figcaption { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-top: 8px; font-size: 12px; line-height: 1.7; color: var(--muted, #6c7381); }
.focus-figure figcaption > span { min-width: 0; }
.focus-figure figcaption > a { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; text-decoration: none; color: var(--muted, #6c7381); }
.focus-figure figcaption > a:hover { color: var(--accent, #5d51c9); }
.focus-bottom { padding: 13px 27px 24px; margin-top: auto; }
.focus-description { max-width: none; margin: 0; color: var(--muted, #6c7381); font-size: 14px; line-height: 1.85; }
.focus-actions { margin-top: 18px; gap: 15px; }
.focus-actions .text-button { color: var(--accent, #5d51c9); font-size: 14px; }
.timeline-entry { display: flex; flex-direction: column; min-width: 0; padding: 26px 25px 22px; color: var(--text, #20242c); background: var(--surface, #fff); border: 1px solid var(--border, #e6e8ee); border-radius: 14px; text-decoration: none; transition: border-color .16s ease, box-shadow .16s ease; }
.timeline-entry:hover { border-color: var(--accent, #5d51c9); box-shadow: 0 7px 22px rgb(53 42 97 / 5%); }
.timeline-entry-heading h2 { margin: 14px 0 7px; font-size: 25px; line-height: 1.35; letter-spacing: -.5px; font-weight: 650; }
.timeline-entry-heading > p { margin: 0; font-size: 14px; line-height: 1.8; color: var(--muted, #6c7381); }
.timeline-preview { display: grid; gap: 18px; margin: 27px 0 24px; }
.timeline-preview-row { position: relative; display: grid; grid-template-columns: 39px minmax(75px, 100px) minmax(0, 1fr); gap: 13px; align-items: center; min-width: 0; }
.preview-year { position: relative; color: var(--muted, #6c7381); font-size: 12px; font-variant-numeric: tabular-nums; }
.timeline-preview-row:not(:last-child) .preview-year::after { content: ''; position: absolute; top: calc(50% + 16px); left: 14px; width: 1px; height: 42px; background: var(--border, #e6e8ee); }
.preview-figure { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; height: 68px; border: 1px solid var(--border, #e6e8ee); border-radius: 7px; color: #878292; background: #fff; overflow: hidden; }
.preview-figure > img { display: block; box-sizing: border-box; min-width: 0; min-height: 0; width: 100%; height: 100%; max-width: 100%; max-height: 100%; padding: 5px; object-fit: contain; }
.preview-paper { min-width: 0; }
.preview-paper strong { display: block; color: var(--text, #20242c); font-size: 16px; line-height: 1.5; font-weight: 650; overflow-wrap: break-word; }
.preview-paper > span { display: block; margin-top: 4px; color: var(--muted, #6c7381); font-size: 12px; line-height: 1.6; }
.timeline-entry-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 17px; border-top: 1px solid var(--border, #e6e8ee); margin-top: auto; font-size: 14px; font-weight: 600; color: var(--accent, #5d51c9); }
.timeline-entry-note { margin: 7px 0 0; color: var(--muted, #6c7381); font-size: 12px; line-height: 1.7; }
.focus-image-link:focus-visible, .timeline-entry:focus-visible, .focus-figure figcaption a:focus-visible { outline: 3px solid var(--accent, #5d51c9); outline-offset: 4px; }
:global(.dark) .focus-card { background: var(--surface, #fff); border-color: var(--border, #e6e8ee); }
:global(.dark) .focus-copy h2, :global(.dark) .focus-question { color: var(--text, #20242c); }
:global(.dark) .focus-description { color: var(--muted, #6c7381); }
:global(.dark) .focus-kicker { color: var(--accent, #5d51c9); }
@media (max-width: 1280px) {
  .visual-hero { grid-template-columns: minmax(0, 1.4fr) minmax(295px, 1fr); gap: 18px; }
  .focus-copy { padding: 24px 23px 17px; }
  .focus-figure { margin: 0 23px; }
  .focus-bottom { padding: 13px 23px 24px; }
  .timeline-entry { padding: 25px 20px 21px; }
  .timeline-preview-row { grid-template-columns: 34px 82px minmax(0, 1fr); gap: 10px; }
}
@media (max-width: 1080px) {
  .visual-hero { grid-template-columns: minmax(0, 1fr); }
  .focus-image-link { height: clamp(200px, 28vw, 290px); }
  .timeline-preview { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin: 22px 0; }
  .timeline-preview-row { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .preview-year { font-size: 13px; }
  .timeline-preview-row:not(:last-child) .preview-year::after { display: none; }
  .preview-figure { height: 92px; }
  .preview-paper strong { font-size: 17px; }
  .timeline-entry { padding: 24px; }
  .timeline-entry-footer { margin-top: 0; }
}
@media (max-width: 760px) {
  .focus-copy { padding: 23px 22px 17px; }
  .focus-figure { margin: 0 22px; }
  .focus-bottom { padding: 13px 22px 23px; }
  .focus-figure figcaption { flex-wrap: wrap; gap: 4px 12px; }
  .focus-image-link { height: clamp(185px, 35vw, 260px); }
  .timeline-entry { padding: 22px; }
  .timeline-entry-heading h2 { font-size: 23px; }
}
@media (max-width: 480px) {
  .focus-copy { padding: 21px 19px 16px; }
  .focus-copy h2 { font-size: 28px; }
  .focus-question { font-size: 16px; }
  .focus-figure { margin: 0 17px; }
  .focus-image-link { height: 185px; }
  .focus-image-link img { padding: 7px; }
  .focus-bottom { padding: 13px 19px 22px; }
  .focus-actions { gap: 12px; }
  .timeline-entry { padding: 22px 20px; }
  .timeline-preview { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .timeline-preview-row { grid-template-columns: 34px 96px minmax(0, 1fr); gap: 12px; }
  .preview-figure { height: 65px; }
  .preview-paper strong { font-size: 16px; }
  .timeline-preview-row:not(:last-child) .preview-year::after { display: block; height: 37px; }
}
@media (prefers-reduced-motion: reduce) { .timeline-entry { transition: none; } }
</style>
