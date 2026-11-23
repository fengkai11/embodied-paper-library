<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../library.data'
import { reviews, markReviewed, unmarkReviewed } from '../state'
import Icon from './Icon.vue'

type Paper = {
  slug: string
  title: string
  shortTitle?: string
  category?: string
  noteType: string
}
type Question = {
  slug: string
  question: string
  answer: string
  followup: string
}
type ReviewCard = Question & { paper: Paper; category: string }

const selectedCategory = ref('全部')
const announcement = ref('')
const questions: Question[] = [
  {
    slug: 'hil-serl',
    question: '为什么人类干预的价值，不止是接管机器人？',
    answer: '干预还提供了偏离状态下的纠正动作和后续转移。这些经验进入训练数据后，能够改变策略见过的状态分布，并为价值学习提供通向任务成功的路径。安全接管、数据覆盖与策略更新，是理解这一闭环的三个角度。',
    followup: '继续追问：如果只保存成功演示，而丢弃干预前的状态，哪些失败恢复信息会丢失？',
  },
  {
    slug: 'industreal',
    question: '为什么仅增加仿真随机化，还不足以解决精密装配迁移？',
    answer: '随机化可以扩展训练分布，但接触仿真的不可靠更新、稀疏的任务引导和真实执行误差仍需要分别处理。IndustReal 将仿真感知策略更新、SDF 几何奖励、采样课程与部署时的动作积分器组合，针对这些不同环节改进。',
    followup: '继续追问：几何距离奖励能否单独判断插入力过大或工件卡滞？',
  },
  {
    slug: 'td-mpc2',
    question: 'TD-MPC2 为什么不必重建完整的未来图像？',
    answer: '控制需要的是能支持动作选择的动态、奖励与价值信息。模型可以在潜空间中保留这些信息，再通过短时轨迹优化选择动作；完整重建所有像素并不是这个目标的必要条件。模型误差与终端价值误差，仍会影响规划结果。',
    followup: '继续追问：当规划器主动寻找高预测回报的动作时，会不会利用模型的误差？',
  },
  {
    slug: 'dino-wm',
    question: '能预测 DINO 视觉特征，是否就等于理解了接触物理？',
    answer: '视觉特征预测提供了目标条件规划的一种表示，但相似图像可能对应不同的摩擦、接触力或微小间隙。对于视觉上难以区分的物理状态，需要用额外观测或专门实验检验模型是否具备足够信息。',
    followup: '继续追问：怎样设计一个视觉接近、摩擦不同的对照实验来检验这个限制？',
  },
  {
    slug: 'pi0',
    question: 'π₀ 中的 flow matching 主要解决哪一层问题？',
    answer: '它为条件化的连续动作块提供生成方式：从噪声逐步得到受视觉、语言与机器人状态约束的动作样本。动作生成形式与训练数据覆盖共同影响系统表现，因此不能仅凭采用流模型就推断跨环境泛化已经解决。',
    followup: '继续追问：固定观测和示范数据后，你会用哪些指标比较 flow action head 与 ACT？',
  },
  {
    slug: 'pi05',
    question: '怎样判断 π₀.₅ 的泛化，超出了对训练场景的复现？',
    answer: '先明确未见环境、物体与任务组合的定义，再检查独立评测划分和完整任务成功情况。多源数据与语义子任务预测提供了信息迁移的途径，但不同数据源的贡献仍需要消融证据支持。',
    followup: '继续追问：如果只改变物体在桌面上的位置，这能支持多大范围的泛化结论？',
  },
  {
    slug: 'pistar06',
    question: '优势条件策略与普通行为克隆，使用的数据有什么关键区别？',
    answer: '普通行为克隆学习数据中的动作分布。优势条件策略进一步引入相对行为质量信号，使生成的动作受优势条件影响；在 RECAP 中，经验与纠正数据共同参与这一改进过程。效果仍依赖价值估计和质量信号的可靠性。',
    followup: '继续追问：当失败轨迹被误判为高优势时，策略提取可能出现什么问题？',
  },
]

const cards = computed<ReviewCard[]>(() => {
  const papers = (entries as Paper[]).filter(entry => entry.noteType === 'paper')
  return questions.flatMap(question => {
    const paper = papers.find(paper => paper.slug === question.slug)
    return paper ? [{ ...question, paper, category: paper.category || '其他' }] : []
  })
})
const categories = computed(() => ['全部', ...new Set(cards.value.map(card => card.category))])
const visibleCards = computed(() => cards.value.filter(card => selectedCategory.value === '全部' || card.category === selectedCategory.value))
const reviewedCount = computed(() => cards.value.filter(card => Boolean(reviews.value[card.slug])).length)

function recordReview(card: ReviewCard) {
  markReviewed(card.slug)
  announcement.value = `已在此浏览器记录 ${card.paper.shortTitle || card.paper.title} 的复习。`
}
function undoReview(card: ReviewCard) {
  unmarkReviewed(card.slug)
  announcement.value = `已撤销 ${card.paper.shortTitle || card.paper.title} 的复习标记。`
}
function reviewDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '已记录'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date)
}
</script>

<template>
  <div class="review-page">
    <header class="page-heading">
      <div class="eyebrow"><Icon name="repeat" /> REVISIT & REFLECT</div>
      <h1>把读过的，重新想明白</h1>
      <p>先合上笔记，用自己的话回答；再展开参考思路，找到还不清楚的地方。</p>
    </header>

    <section class="review-summary" aria-label="当前浏览器中的复习记录">
      <div class="summary-icon"><Icon name="repeat" /></div>
      <div class="summary-copy">
        <h2>从一个问题开始</h2>
        <p>这里记录复习行为。理解程度，由你通过问题判断。</p>
        <span class="local-note">复习标记仅保存在当前浏览器，随时可以撤销。</span>
      </div>
      <div class="review-count">
        <strong>{{ reviewedCount }}<span> / {{ cards.length }}</span></strong>
        <span>已标记复习</span>
      </div>
    </section>

    <div class="filter-row">
      <div class="category-filters" aria-label="按论文类别筛选复习题">
        <button
          v-for="category in categories"
          :key="category"
          class="category-filter"
          :class="{ active: selectedCategory === category }"
          :aria-pressed="selectedCategory === category"
          aria-controls="review-questions"
          @click="selectedCategory = category"
        >{{ category }}</button>
      </div>
      <span class="question-count" aria-live="polite">{{ visibleCards.length }} 个问题</span>
    </div>

    <div id="review-questions" class="question-list">
      <article v-for="card in visibleCards" :key="card.slug" class="question-card">
        <div class="card-meta">
          <span class="paper-name">{{ card.paper.shortTitle || card.paper.title }}</span>
          <span class="category-label">{{ card.category }}</span>
        </div>
        <details class="question-details">
          <summary>
            <span class="summary-text">
              <span class="question-title">{{ card.question }}</span>
              <span class="expand-hint"><span class="closed-label">思考后，展开参考答案</span><span class="open-label">收起参考答案</span></span>
            </span>
            <span class="expand-icon"><Icon name="chevron" /></span>
          </summary>
          <div class="answer-content">
            <div class="answer-label">参考思路</div>
            <p>{{ card.answer }}</p>
            <div class="followup-question">{{ card.followup }}</div>
          </div>
        </details>
        <footer class="card-footer">
          <a :href="withBase('/papers/' + card.slug + '.html')" class="note-link"><Icon name="book" /> 回到论文笔记</a>
          <div v-if="reviews[card.slug]" class="reviewed-actions">
            <span class="reviewed-label"><Icon name="check" /><time :datetime="reviews[card.slug]">{{ reviewDate(reviews[card.slug]) }}</time>已复习</span>
            <button class="undo-button" :aria-label="`撤销 ${card.paper.shortTitle || card.paper.title} 的复习标记`" @click="undoReview(card)">撤销</button>
          </div>
          <button v-else class="mark-button" @click="recordReview(card)"><Icon name="check" /> 标记本次复习</button>
        </footer>
      </article>
      <div v-if="!visibleCards.length" class="empty-state">
        <Icon name="book" />
        <h2>暂时没有这一类复习题</h2>
        <p>可以先浏览其他类别的研究问题。</p>
        <button class="mark-button" @click="selectedCategory = '全部'">显示全部问题</button>
      </div>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
    <p class="review-footnote">参考答案是回看线索。涉及公式、实验数字与适用条件，请回到论文笔记和原文核对。</p>
  </div>
</template>

<style scoped>
.review-page { color: var(--text, #20242c); }
.page-heading { margin-bottom: 28px; }
.eyebrow { display: flex; align-items: center; gap: 9px; color: var(--accent, #5d51c9); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.eyebrow :deep(svg) { width: 17px; height: 17px; }
h1 { margin: 14px 0 10px; font-size: clamp(28px, 3.1vw, 38px); line-height: 1.35; letter-spacing: -.035em; font-weight: 700; }
.page-heading > p { margin: 0; color: var(--muted, #6c7381); font-size: 16px; line-height: 1.8; }
.review-summary { display: flex; align-items: center; gap: 18px; padding: 25px 27px; border: 1px solid var(--border, #e6e8ee); border-radius: 14px; background: var(--surface, #fff); }
.summary-icon { display: grid; place-items: center; width: 47px; height: 47px; flex: 0 0 47px; border-radius: 12px; background: var(--accent-light, #efedfb); color: var(--accent, #5d51c9); }
.summary-icon :deep(svg) { width: 23px; height: 23px; }
.summary-copy { flex: 1; min-width: 0; }
.summary-copy h2 { margin: 0; padding: 0; border: 0; font-size: 17px; line-height: 1.5; font-weight: 650; }
.summary-copy p { margin: 5px 0 3px; font-size: 14px; line-height: 1.7; }
.local-note { color: var(--muted, #6c7381); font-size: 12px; line-height: 1.6; }
.review-count { padding-left: 26px; border-left: 1px solid var(--border, #e6e8ee); text-align: right; white-space: nowrap; }
.review-count strong { display: block; font-size: 29px; line-height: 1.3; font-weight: 650; color: var(--accent, #5d51c9); font-variant-numeric: tabular-nums; }
.review-count strong span { font-size: 18px; color: var(--muted, #6c7381); font-weight: 450; }
.review-count > span { display: block; margin-top: 4px; font-size: 12px; color: var(--muted, #6c7381); }
.filter-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 30px 0 18px; }
.category-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.category-filter { padding: 8px 13px; min-height: 39px; border: 1px solid transparent; border-radius: 7px; font: inherit; font-size: 14px; font-weight: 500; line-height: 1.5; color: var(--muted, #6c7381); background: transparent; cursor: pointer; }
.category-filter:hover { color: var(--accent, #5d51c9); background: var(--accent-light, #efedfb); }
.category-filter.active { color: var(--accent, #5d51c9); background: var(--accent-light, #efedfb); border-color: var(--accent, #5d51c9); font-weight: 650; }
.question-count { flex-shrink: 0; color: var(--muted, #6c7381); font-size: 13px; }
.question-list { display: grid; gap: 16px; }
.question-card { min-width: 0; padding: 22px 25px 0; background: var(--surface, #fff); border: 1px solid var(--border, #e6e8ee); border-radius: 13px; }
.card-meta { display: flex; align-items: center; gap: 10px; }
.paper-name { font-size: 13px; font-weight: 650; color: var(--accent, #5d51c9); }
.category-label { padding: 2px 7px; border: 1px solid var(--border, #e6e8ee); border-radius: 5px; color: var(--muted, #6c7381); font-size: 12px; }
.question-details { margin-top: 13px; }
.question-details summary { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 0 0 18px; list-style: none; cursor: pointer; border-radius: 4px; }
.question-details summary::-webkit-details-marker { display: none; }
.summary-text { min-width: 0; }
.question-title { display: block; font-size: 18px; font-weight: 600; line-height: 1.7; }
.expand-hint { display: block; margin-top: 9px; font-size: 13px; line-height: 1.6; color: var(--muted, #6c7381); }
.open-label { display: none; }
.question-details[open] .open-label { display: inline; }
.question-details[open] .closed-label { display: none; }
.expand-icon { display: grid; place-items: center; flex: 0 0 29px; width: 29px; height: 29px; margin-top: 2px; border: 1px solid var(--border, #e6e8ee); border-radius: 7px; color: var(--muted, #6c7381); }
.expand-icon :deep(svg) { width: 15px; height: 15px; transform: rotate(90deg); transition: transform .16s ease; }
.question-details[open] .expand-icon :deep(svg) { transform: rotate(-90deg); }
.answer-content { padding: 20px 22px; margin: 0 0 21px; background: var(--bg, #f6f7fa); border-left: 2px solid var(--accent, #5d51c9); border-radius: 0 8px 8px 0; }
.answer-label { color: var(--accent, #5d51c9); font-size: 13px; font-weight: 650; }
.answer-content > p { margin: 9px 0 0; font-size: 16px; line-height: 1.9; }
.followup-question { margin-top: 16px; padding-top: 13px; border-top: 1px solid var(--border, #e6e8ee); color: var(--muted, #6c7381); font-size: 14px; line-height: 1.8; }
.card-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 13px 0; border-top: 1px solid var(--border, #e6e8ee); }
.note-link { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; color: var(--muted, #6c7381); font-size: 13px; text-decoration: none; }
.note-link:hover { color: var(--accent, #5d51c9); }
.note-link :deep(svg), .mark-button :deep(svg), .reviewed-label :deep(svg) { width: 15px; height: 15px; }
.mark-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 7px 12px; border: 1px solid var(--border, #e6e8ee); border-radius: 7px; color: var(--text, #20242c); background: var(--surface, #fff); font: inherit; font-size: 14px; cursor: pointer; }
.mark-button:hover { border-color: var(--accent, #5d51c9); color: var(--accent, #5d51c9); background: var(--accent-light, #efedfb); }
.reviewed-actions { display: flex; gap: 13px; align-items: center; }
.reviewed-label { display: inline-flex; gap: 4px; align-items: center; color: var(--accent, #5d51c9); font-size: 13px; }
.undo-button { min-height: 38px; padding: 7px 4px; color: var(--muted, #6c7381); background: transparent; border: 0; font: inherit; font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.undo-button:hover { color: var(--text, #20242c); }
.review-footnote { margin: 25px 0 0; color: var(--muted, #6c7381); font-size: 13px; line-height: 1.8; }
.empty-state { display: grid; justify-items: center; padding: 45px 24px; text-align: center; border: 1px dashed var(--border, #e6e8ee); border-radius: 12px; background: var(--surface, #fff); }
.empty-state > :deep(svg) { width: 27px; height: 27px; color: var(--muted, #6c7381); }
.empty-state h2 { margin: 16px 0 5px; font-size: 17px; }
.empty-state p { margin: 0 0 17px; color: var(--muted, #6c7381); font-size: 14px; }
button:focus-visible, a:focus-visible, summary:focus-visible { outline: 3px solid var(--accent, #5d51c9); outline-offset: 4px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 700px) {
  .review-summary { padding: 21px; gap: 14px; flex-wrap: wrap; }
  .summary-icon { width: 40px; height: 40px; flex-basis: 40px; }
  .review-count { padding-left: 18px; }
  .filter-row { align-items: flex-start; }
  .question-count { padding-top: 10px; }
  .question-card { padding: 20px 21px 0; }
  .question-title { font-size: 17px; }
}
@media (max-width: 470px) {
  .review-summary { padding: 19px; align-items: flex-start; }
  .summary-icon { display: none; }
  .summary-copy { flex-basis: 100%; }
  .review-count { display: flex; align-items: center; gap: 11px; padding-left: 0; padding-top: 12px; margin-top: 1px; width: 100%; border-left: 0; border-top: 1px solid var(--border, #e6e8ee); text-align: left; }
  .review-count strong { font-size: 25px; }
  .review-count > span { margin-top: 0; }
  .filter-row { flex-direction: column; gap: 8px; margin-top: 24px; }
  .question-count { padding-top: 0; }
  .category-filter { padding: 7px 10px; }
  .question-card { padding: 18px 17px 0; }
  .card-meta { flex-wrap: wrap; gap: 6px; }
  .question-details summary { gap: 10px; }
  .answer-content { padding: 16px; }
  .card-footer { gap: 7px; }
  .reviewed-actions { gap: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .expand-icon :deep(svg) { transition: none; }
}
</style>
