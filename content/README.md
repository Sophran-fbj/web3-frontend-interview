# 题库内容

`content/questions` 是题目正文的唯一来源。每道题使用一个 MDX 文件，并通过 frontmatter 记录分类、难度、适用生态、技术版本、审核状态和参考资料。

新题从 [`QUESTION_TEMPLATE.mdx`](./QUESTION_TEMPLATE.mdx) 复制。编写完成后按以下状态流转：

```text
draft → review → verified
                   ↓
             needs-review
```

- `draft` 可以包含占位内容，但不会公开展示。
- `review` 必须包含完整回答、三级评分标准和可靠来源；单人维护阶段可以直接公开。
- `verified` 保留给未来协作审核，必须填写 `verifiedAt` 和真实审核者，不允许 AI 自行标记。
- 依赖版本发生重大变化或超过复查周期后，改为 `needs-review`。

`status`、`updatedAt`、`verifiedAt`、`reviewers`、`changeLog` 等字段用于内容维护和未来扩展，当前不在公开题目页面展示。公开页面只渲染题目正文、难度、分类、题型、适用生态、技术版本、标签和参考资料；单人维护阶段，内容完整的 `review` 与 `verified` 题目都进入公开题库，其他状态只在开发预览中显示。

来源优先级为：标准/EIP、官方文档、官方迁移说明、可复现代码、经过匿名处理的生产案例或真实面经。二手文章只能作为选题线索，不能单独支撑技术结论。

提交内容前运行：

```bash
pnpm content:validate
```

题目正文与原创图文采用 CC BY-SA 4.0 授权，第三方引用仍遵循其原始许可。
