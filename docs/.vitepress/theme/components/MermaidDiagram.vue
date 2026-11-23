<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { isDark } from '../state'
const props = defineProps<{ source: string }>()
const target = ref<HTMLElement>()
const error = ref(false)
const source = decodeURIComponent(props.source)
let seq = 0
async function render() {
  if (!target.value) return
  try {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark.value ? 'dark' : 'neutral', fontFamily: 'system-ui, sans-serif' })
    const { svg } = await mermaid.render(`diagram-${Date.now()}-${seq++}`, source)
    target.value.innerHTML = svg
  } catch { error.value = true }
}
onMounted(render)
watch(isDark, render)
</script>
<template><div class="mermaid-figure" ref="target" role="img" aria-label="论文方法关系图"><pre>{{ source }}</pre></div><p v-if="error" class="muted">关系图暂时无法渲染，以上保留原始结构。</p></template>
