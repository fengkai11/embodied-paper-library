<script setup lang="ts">
defineProps<{ name: string; size?: number }>()
const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z M13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2',
  map: 'M4 5h5v5H4z M15 14h5v5h-5z M6.5 10v6.5H15 M9 7.5h8.5V14',
  layers: 'm12 3 10 5-10 5L2 8z M3 13l9 5 9-5 M3 18l9 5 9-5',
  flask: 'M9 3h6 M10 3v7l-6 9a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2l-6-9V3 M8 15h8',
  repeat: 'M20 7v5h-5 M4 17v-5h5 M5 8a7 7 0 0 1 12-3l3 3 M19 16a7 7 0 0 1-12 3l-3-3',
  search: 'M10.8 3a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6 M16.5 16.5 22 22',
  bookmark: 'M6 3h12v19l-6-4-6 4z',
  external: 'M14 3h7v7 M21 3l-11 11 M10 4H4v16h16v-6',
  chevron: 'm9 5 7 7-7 7',
  close: 'm5 5 14 14 M19 5 5 19',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  check: 'm4 12 5 5L20 6',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 6v6l4 2',
  file: 'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M20 4l-2 2 M6 18l-2 2',
  moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10',
  code: 'm7 6-6 6 6 6 M17 6l6 6-6 6 M14 3l-4 18',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  list: 'M8 5h13 M8 12h13 M8 19h13 M3 5h.01 M3 12h.01 M3 19h.01',
  github: 'M9 19c-4 1-4-2-6-2 M15 22v-4a3.5 3.5 0 0 0-1-3c3-.3 6-1.5 6-6a5 5 0 0 0-1.4-3.5c.1-1 0-2-.4-3-1.5 0-3 .8-3.7 1.3a12 12 0 0 0-5 0C8.8 3.3 7.3 2.5 5.8 2.5c-.4 1-.5 2-.4 3A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6a3.5 3.5 0 0 0-1 3v4',
}
</script>
<template><svg :width="size || 20" :height="size || 20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.file" /></svg></template>
