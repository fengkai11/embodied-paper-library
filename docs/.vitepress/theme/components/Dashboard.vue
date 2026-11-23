<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../library.data'
import { history } from '../state'
import Icon from './Icon.vue'
import PaperLibrary from './PaperLibrary.vue'
const papers = entries.filter(e => e.noteType === 'paper')
const featured = computed(() => papers.find(p => p.slug === history.value[0]?.slug) || papers.find(p => p.slug === 'pistar06') || papers[0])
const resumed = computed(() => !!history.value[0])
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

  <section class="hero-grid" aria-label="阅读入口">
    <div class="focus-card" v-if="featured">
      <div class="focus-copy"><span class="focus-kicker"><Icon name="book" :size="16" />{{ resumed ? '最近浏览 · 继续思考' : '从这里开始 · 经验驱动的学习' }}</span><h2>{{ featured.shortTitle }}</h2><p class="focus-question">{{ featured.question }}</p><p class="focus-description">{{ featured.takeaway }}</p><div class="focus-actions"><a class="button primary" :href="withBase(featured.url)">进入精读笔记</a><a class="text-button" :href="withBase(relatedDestination.url)">{{ relatedDestination.label }}</a></div></div>
      <div class="concept-art" aria-hidden="true"><div class="art-grid"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="concept-core"><Icon name="layers" :size="40" /><span>LEARN</span></div><span class="concept-label label-one"><span></span>经验</span><span class="concept-label label-two"><span></span>价值</span><span class="concept-label label-three"><span></span>策略</span><div class="art-caption">FROM EXPERIENCE<br>TO BETTER ACTIONS</div></div>
    </div>
    <aside class="question-panel"><div class="section-kicker"><Icon name="spark" :size="17" />带着问题阅读</div><h2>不只记住结论，<br>更理解为什么。</h2><a :href="withBase('/papers/hil-serl.html')"><span class="mini-letter">Q</span><span>人类干预如何改变 Critic<br>学到的价值？</span><Icon name="chevron" :size="16" /></a><a :href="withBase('/papers/dino-wm.html')"><span class="mini-letter">Q</span><span>视觉世界模型能理解<br>精密接触吗？</span><Icon name="chevron" :size="16" /></a><p>沿着一个问题，连接不同的技术路线。</p></aside>
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
