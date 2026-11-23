import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import './style.css'

export default {
  Layout,
  enhanceApp({ app }) { app.component('MermaidDiagram', MermaidDiagram) },
} satisfies Theme
