# AI To-Do — 待办事项应用

简洁现代的待办事项 Web 应用，基于 **Vue 3 + Vite + Element Plus** 构建，交互动画使用 **GSAP**，样式采用 **SCSS**，数据保存在浏览器本地存储。

## 功能

- 添加、完成、删除、编辑任务
- 任务优先级（高 / 中 / 低）
- 筛选：全部 / 进行中 / 已完成
- 清除已完成、全部清空（均需确认）
- 浅色 / 深色主题切换
- 列表最多显示 6 条，超出内部滚动，页面无滚动条

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问终端显示的地址（默认 `http://localhost:5173`）。

生产构建：

```bash
npm run build
npm run preview
```

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Element Plus（UI 组件）
- Pinia（任务状态管理）
- GSAP（交互动画）
- SCSS（组件内 `lang="scss"` + CSS 变量主题）
- Vite 6
- localStorage 持久化

## 文档

| 文档 | 说明 |
|------|------|
| [docs/需求文档.md](docs/需求文档.md) | 需求文档 |
| [docs/功能模块文档.md](docs/功能模块文档.md) | 功能模块文档 |
| [docs/实现步骤文档.md](docs/实现步骤文档.md) | 实现步骤文档 |

## 项目结构

```
ai-to-do/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js
    ├── App.vue
    ├── components/
    │   ├── TodoApp.vue
    │   └── TaskItem.vue
    ├── composables/
    │   ├── useTasks.js
    │   ├── useFilter.js
    │   ├── useTheme.js
    │   └── useGsapContext.js
    ├── stores/
    │   └── tasks.js
    ├── utils/
    │   └── storage.js
    └── styles/
        ├── _variables.scss
        └── global.scss
```
