---
title: π*₀.₆：让 VLA 从经验中继续进步
shortTitle: π*₀.₆
description: 将示范、自主交互与专家纠正接入优势条件化的策略学习。
year: 2025
category: VLA
tags: [VLA, 强化学习, 经验学习]
status: 速览草稿
updated: '2026-11-23'
question: 通用操作模型能否利用部署中的成功、失败与纠正持续改善？
source: https://arxiv.org/abs/2511.14759
related: [pi0, pi05, hil-serl]
takeaway: RECAP 用价值与优势信息，让策略区分经验中的行为质量。
noteType: paper
---

## 30 秒回忆

**π*₀.₆ 使用 RECAP，将经验与纠正接入 VLA 的强化学习训练。** RECAP 的全称是 RL with Experience and Corrections via Advantage-conditioned Policies。它利用示范、当前策略采样和专家遥操作干预。[原文](https://arxiv.org/abs/2511.14759)

## 研究问题

模仿学习提供了技能起点。机器人部署后积累的慢速成功、失败与纠正，怎样成为下一轮策略改进的有效信号？

## 核心机制

[论文](https://arxiv.org/abs/2511.14759)以优势条件支持策略学习，并通过机器人数据收集进行任务专化。理解时需分开三件事：价值模型估计结果、优势信息表达相对行为质量、策略根据条件产生动作。

$$
\pi_\theta(a\mid c,\text{advantage condition})
$$

上式只是概念表示，**不是 RECAP 的完整损失或策略提取公式**。下一次精读重点应是 Distributional Value Training 与 Advantage-conditioned Policy Extraction。

## 证据与边界

作者展示了叠衣服、组装纸箱与制作咖啡的任务改进。数据规模、初始模型能力和人工纠正成本都影响结果；不能将这些实验与 HIL-SERL 的成功率直接横比。两者应先对齐任务和交互预算。

## 理解自测

<details>
<summary>它与单纯“多收集一些演示”有什么区别？</summary>

关键不仅是数据变多，还在于利用任务结果和价值信息区分行为质量。需要检查优势如何估计、如何进入策略训练，以及估计错误怎样影响改进。

</details>

## 最小实验

**拟开展**：在已有 BC 上收集自主执行与纠正数据，尝试简化的质量条件策略。它只能验证局部思想，不能称为完整 RECAP 复现；与等数据量的普通再训练对照。

## 来源

- [原始论文：arXiv 2511.14759](https://arxiv.org/abs/2511.14759)
- [跨论文专题：从经验中学习](/topics/learning-from-experience.md)
