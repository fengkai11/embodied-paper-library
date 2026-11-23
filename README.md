# 具身研读 · Embodied Paper Library

「论文精读」项目的长期知识库。固定关联仓库：
[fengkai11/embodied-paper-library](https://github.com/fengkai11/embodied-paper-library)。

围绕 **理解 → 判断 → 工程证据 → 后续行动** 组织内容。Markdown 是唯一笔记源，VitePress 构建静态网站，GitHub Pages 用于正式发布。

## 当前版本

- 研究首页：重点阅读入口、最近浏览、论文索引、专题线索。
- 论文库：类别筛选、正文关键词检索、排序、收藏。
- 阅读页：来源、整理状态、公式、关系图、目录、关联论文、折叠自测。
- 技术路线：四条研究主线，按首次公开稿年份浏览。
- 专题比较与实验计划：统一比较维度，明确区分计划和结果。
- 复习中心：先答题再展开要点，主动标记复习并支持撤销。
- 全站搜索：`Ctrl/Cmd + K`，检索 Markdown 正文和元信息。
- 响应式布局、深浅主题、键盘导航。

首批七篇为**新整理的速览草稿**，不是旧聊天完整归档，也不表示已完成原文精读或工程复现。

收藏、最近浏览、复习标记与主题保存在当前浏览器的 localStorage；不写入公开仓库，不跨设备同步。无登录、数据库或外部搜索服务。

## 本地运行

Node.js 22 或更高版本。

```bash
npm ci
npm run docs:dev
```

生产构建：

```bash
npm run check
npm run docs:build
npm run docs:preview
```

输出目录为 `dist/`。公式由 MathJax 在构建时处理；Mermaid 在需要时加载；搜索索引从 Markdown 自动生成。

## GitHub Pages

1. 将设计分支的 PR 合并到 `main`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 运行 `Build and publish knowledge library` 工作流，或推送一次更新到 `main`。
4. 工作流部署成功后，正式网址为 `https://fengkai11.github.io/embodied-paper-library/`。

**该网址是目标部署地址，README 本身不代表已经上线。** 仓库改名时同时调整工作流中的 `SITE_BASE` 与站点编辑链接。

PR 只构建验证；仅主分支或手动运行触发发布。私有设计预览与 GitHub Pages 正式站点分开。

## 内容目录

| 位置 | 用途 |
| --- | --- |
| `docs/papers/` | 每篇论文一份 Markdown，元信息驱动索引 |
| `docs/topics/` | 跨论文专题与比较 |
| `docs/experiments/` | 实验计划、验收、后续结果 |
| `docs/templates/paper.md` | 导师式精读模板 |
| `docs/.vitepress/theme/` | 网站布局与交互 |
| `design/website-design.md` | 产品与视觉设计决策 |

## 新增论文

在 `docs/papers/` 新建 `.md`，可参考现有文件；顶部必须包含：

```yaml
---
title: 算法名：这篇论文解决什么
shortTitle: 算法名
description: 一句话简介
year: 2026
category: RL
tags: [强化学习, 操作]
status: 速览草稿
updated: '2026-11-23'
question: 最重要的研究问题？
source: https://arxiv.org/abs/真实编号
related: [hil-serl]
takeaway: 起作用的关键机制。
noteType: paper
---
```

`category` 使用 `VLA`、`RL`、`世界模型`、`精密操作`。`year` 为首次公开稿年份，会议年份另写。正文从 H2 开始，页面标题自动从 frontmatter 生成。

论文索引、搜索与年份时间线自动更新。路线的语义关联和复习问题需要经过整理，再分别维护对应组件；不要从收藏或访问推断掌握程度。

## 依据与维护

- [VitePress 1.x 文档](https://vitepress.dev/)
- [自定义主题](https://vitepress.dev/guide/custom-theme)
- [GitHub Pages 部署](https://vitepress.dev/guide/deploy#github-pages)
- 各笔记正文包含原论文、作者项目页或代码来源。

论文事实、作者主张、研究推断和待验证假设分别记录。论文原文版权属于其作者；本库只保留链接与简要研究笔记。
