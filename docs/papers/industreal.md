---
title: IndustReal：跨过装配的仿真与现实鸿沟
shortTitle: IndustReal
description: 从接触训练、几何奖励到部署控制，逐项处理装配迁移中的误差。
year: 2023
category: 精密操作
tags: [精密装配, 仿真迁移, 接触控制]
status: 速览草稿
updated: '2026-11-23'
question: 在仿真中学会的接触丰富技能，怎样可靠地迁移到真实装配？
source: https://arxiv.org/abs/2305.17110
related: [hil-serl, dino-wm]
takeaway: 接触仿真、奖励塑形、课程与部署误差，需要分别处理。
noteType: paper
---

## 30 秒回忆

**IndustReal 面向接触丰富的机器人装配迁移。** 它组合仿真感知策略更新、SDF 奖励、采样式课程与策略层动作积分器，而非只依靠一种随机化技巧。[原文](https://arxiv.org/abs/2305.17110)

## 研究问题

插入任务对位置和接触误差敏感。仿真中取得高回报，可能仍无法在真实硬件上稳定执行。需要追问：问题出在物理仿真、学习目标、训练分布，还是控制执行？

## 核心机制

| 组件 | 处理的问题 |
| --- | --- |
| Simulation-Aware Policy Update | 将仿真可靠性纳入训练更新 |
| SDF reward | 用物体几何提供学习信号 |
| Sampling-Based Curriculum | 调节训练样本的难度 |
| Policy-level Action Integrator | 缓解策略部署时的执行误差 |

这些是[论文摘要](https://arxiv.org/abs/2305.17110)明确列出的组成。每一项的公式、适用条件和消融收益仍需逐项核对。

## 证据与边界

论文展示了抓取、放置和插入的仿真训练及真实系统迁移。**研究判断**：不同工件公差、摩擦和传感器配置可能改变结果，不能把某组实验成功直接解释为所有工业装配都已解决。

## 理解自测

<details>
<summary>为什么奖励设计与仿真可靠性不能互相替代？</summary>

奖励决定策略倾向于追求什么；仿真决定动作后果是否可信。一个目标合理、物理后果错误的训练过程，仍可能鼓励不可迁移的行为。

</details>

## 最小实验

**拟开展**：建立统一插入环境，先比较位置距离奖励与几何距离奖励；再分别加入初态课程和执行偏差。记录成功率、卡滞次数与峰值接触力，避免一次改动全部组件。

## 来源

- [原始论文：RSS 2023](https://arxiv.org/abs/2305.17110)
- [相关专题：精密装配的学习边界](/topics/precision-assembly.md)
