<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { withBase } from 'vitepress'
import Icon from './Icon.vue'

const props = defineProps<{
  visual: {
    image: string
    alt: string
    caption: string
    sourcePage: string
    kind: string
  }
  title: string
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const imageFailed = ref(false)
const captionId = `paper-figure-caption-${useId()}`
let returnFocus: HTMLElement | null = null
const kindLabels: Record<string, string> = {
  method: '方法示意图',
  architecture: '方法示意图',
  task: '任务场景',
  overview: '项目概览',
  poster: '项目展示',
}
const kindLabel = computed(() => kindLabels[props.visual.kind] || props.visual.kind || '作者项目图')

function openFigure(event: MouseEvent) {
  returnFocus = event.currentTarget as HTMLElement
  dialog.value?.showModal()
}

function closeFigure() {
  dialog.value?.close()
}

function restoreFocus() {
  returnFocus?.focus({ preventScroll: true })
  returnFocus = null
}

function closeFromBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeFigure()
}

watch(() => props.visual.image, () => {
  imageFailed.value = false
  closeFigure()
})
onBeforeUnmount(closeFigure)
</script>

<template>
  <figure class="paper-figure">
    <div class="figure-topline">
      <span>{{ kindLabel }}</span>
      <button v-if="!imageFailed" class="figure-expand" type="button" :aria-label="`放大查看 ${title} 图片`" @click="openFigure">
        <Icon name="search" :size="15" /> 查看大图
      </button>
    </div>
    <button
      v-if="!imageFailed"
      class="figure-stage"
      type="button"
      :aria-label="`查看 ${title} 完整图片`"
      :aria-describedby="captionId"
      @click="openFigure"
    >
      <img :src="withBase(visual.image)" :alt="visual.alt" loading="lazy" decoding="async" @error="imageFailed = true">
    </button>
    <div v-else class="figure-fallback" role="status">
      <Icon name="file" :size="25" />
      <p>图片暂时无法显示</p>
      <span>{{ visual.alt }}</span>
    </div>
    <figcaption :id="captionId">
      <p>{{ visual.caption }}</p>
      <a :href="visual.sourcePage" target="_blank" rel="noopener noreferrer">查看图片来源 <Icon name="external" :size="13" /></a>
    </figcaption>

    <dialog ref="dialog" class="figure-dialog" :aria-label="`${title} 图片大图`" @close="restoreFocus" @click="closeFromBackdrop">
      <div class="figure-dialog-header">
        <div><strong>{{ title }}</strong><span>{{ kindLabel }}</span></div>
        <button class="figure-close" type="button" aria-label="关闭大图" autofocus @click="closeFigure"><Icon name="close" :size="21" /></button>
      </div>
      <div class="figure-dialog-image"><img :src="withBase(visual.image)" :alt="visual.alt"></div>
      <div class="figure-dialog-caption"><p>{{ visual.caption }}</p><a :href="visual.sourcePage" target="_blank" rel="noopener noreferrer">图片来源 <Icon name="external" :size="13" /></a><a :href="withBase(visual.image)" target="_blank" rel="noopener noreferrer">打开原尺寸 <Icon name="external" :size="13" /></a></div>
    </dialog>
  </figure>
</template>

<style scoped>
.paper-figure { min-width: 0; margin: 0; border: 1px solid var(--border, #e6e8ee); border-radius: 13px; overflow: hidden; background: var(--surface, #fff); }
.figure-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 46px; padding: 8px 15px; border-bottom: 1px solid var(--border, #e6e8ee); }
.figure-topline > span { color: var(--muted, #6c7381); font-size: 12px; }
.figure-expand { display: inline-flex; align-items: center; gap: 6px; padding: 6px 0 6px 9px; border: 0; background: none; color: var(--accent, #6657ce); font: inherit; font-size: 12px; cursor: pointer; }
.figure-stage { display: block; width: 100%; height: var(--paper-figure-height, 300px); padding: 16px; border: 0; background: #fff; cursor: zoom-in; }
.figure-stage img { display: block; width: 100%; height: 100%; object-fit: contain; }
figcaption { padding: 13px 16px 14px; border-top: 1px solid var(--border, #e6e8ee); }
figcaption p, .figure-dialog-caption p { margin: 0; color: var(--muted, #6c7381); font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
figcaption a, .figure-dialog-caption a { display: inline-flex; align-items: center; gap: 5px; color: var(--accent, #6657ce); font-size: 12px; line-height: 1.8; text-decoration: none; margin-top: 7px; }
figcaption a:hover, .figure-dialog-caption a:hover { text-decoration: underline; text-underline-offset: 3px; }
.figure-fallback { display: flex; min-height: 220px; flex-direction: column; justify-content: center; align-items: center; gap: 9px; padding: 22px; text-align: center; color: var(--muted, #6c7381); }
.figure-fallback p { margin: 0; color: var(--text, #20242c); font-size: 14px; }
.figure-fallback span { font-size: 13px; line-height: 1.8; }
.figure-dialog { width: min(1160px, calc(100vw - 40px)); max-width: none; max-height: calc(100dvh - 40px); padding: 0; margin: auto; border: 1px solid var(--border, #e6e8ee); border-radius: 14px; background: var(--surface, #fff); color: var(--text, #20242c); overflow: auto; box-shadow: 0 24px 100px #10152555; }
.figure-dialog::backdrop { background: #171c2dc9; backdrop-filter: blur(5px); }
.figure-dialog-header { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 18px; background: var(--surface, #fff); border-bottom: 1px solid var(--border, #e6e8ee); z-index: 1; }
.figure-dialog-header > div { display: flex; align-items: baseline; flex-wrap: wrap; gap: 5px 13px; min-width: 0; }
.figure-dialog-header strong { font-size: 16px; font-weight: 600; line-height: 1.7; overflow-wrap: anywhere; }
.figure-dialog-header span { font-size: 12px; color: var(--muted, #6c7381); }
.figure-close { display: grid; flex: 0 0 38px; width: 38px; height: 38px; place-items: center; padding: 0; background: var(--bg, #f6f7fa); color: var(--text, #20242c); border: 1px solid var(--border, #e6e8ee); border-radius: 8px; cursor: pointer; }
.figure-dialog-image { padding: 20px; background: #fff; }
.figure-dialog-image img { display: block; width: 100%; max-height: 68dvh; object-fit: contain; }
.figure-dialog-caption { padding: 15px 20px 19px; }
.figure-dialog-caption a + a { margin-left: 20px; }
button:focus-visible, a:focus-visible { outline: 3px solid var(--accent, #6657ce); outline-offset: -3px; }
.figure-expand:focus-visible, figcaption a:focus-visible, .figure-dialog-caption a:focus-visible { outline-offset: 3px; }
@media (max-width: 600px) {
  .figure-stage { height: var(--paper-figure-height, 210px); padding: 10px; }
  .figure-topline { padding-right: 13px; padding-left: 13px; }
  figcaption { padding: 11px 13px 13px; }
  .figure-dialog { width: calc(100vw - 20px); max-height: calc(100dvh - 24px); border-radius: 10px; }
  .figure-dialog-header { padding: 11px 12px; }
  .figure-dialog-image { padding: 10px; }
  .figure-dialog-image img { max-height: 60dvh; }
  .figure-dialog-caption { padding: 13px 14px 17px; }
}
</style>
