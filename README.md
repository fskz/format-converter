# Format Converter

Excel (.xlsx) ↔ JSON 格式互转工具。

## 功能特性

- **双向转换**：支持 Excel 转 JSON 和 JSON 转 Excel
- **图形界面**：基于 Tauri 的跨平台桌面应用
- **命令行工具**：支持 CLI 方式批量处理
- **批量转换**：支持多文件批量处理
- **数据预览**：转换前可预览文件内容

## 安装

### 前置要求

- [Rust](https://rustup.rs/) (最新稳定版)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) 包管理器

### 安装依赖

```bash
# 安装 UI 依赖
cd ui && pnpm install

# 安装 Tauri CLI (可选，如果全局未安装)
pnpm add -D @tauri-apps/cli
```

## 使用方式

### 图形界面 (GUI)

开发模式：

```bash
pnpm tauri dev
```

构建生产版本：

```bash
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

### 命令行 (CLI)

编译 CLI 工具：

```bash
cargo build --release
```

使用方式：

```bash
# Excel 转 JSON
./target/release/format-converter xlsx2json input.xlsx output.json

# JSON 转 Excel
./target/release/format-converter json2xlsx input.json output.xlsx
```

## JSON 格式说明

JSON 文件应为对象数组格式，每个对象代表一行数据：

```json
[
  { "姓名": "张三", "年龄": 25, "城市": "北京" },
  { "姓名": "李四", "年龄": 30, "城市": "上海" }
]
```

转换后的 Excel 文件将以 JSON 对象的键作为列标题。

## 技术栈

- **后端**：Rust
  - [calamine](https://github.com/tamasfe/calamine) - Excel 读取
  - [rust_xlsxwriter](https://github.com/jmcnamara/rust_xlsxwriter) - Excel 写入
- **前端**：React + TypeScript
  - [Tauri](https://tauri.app/) - 桌面应用框架
  - [Tailwind CSS](https://tailwindcss.com/) - 样式
  - [Radix UI](https://www.radix-ui.com/) - UI 组件
  - [React Query](https://tanstack.com/query) - 数据请求

## 项目结构

```
.
├── src/                # Rust 核心库
│   ├── core/           # 转换核心逻辑
│   └── commands/       # Tauri 命令
├── src-tauri/          # Tauri 应用配置
├── ui/                 # React 前端
│   └── src/
│       ├── components/ # UI 组件
│       └── hooks/      # React Hooks
└── docs/               # 文档
```

## 开发

### 运行测试

```bash
# UI 测试
cd ui && pnpm test

# Rust 测试
cargo test
```

### 类型检查

```bash
cd ui && pnpm typecheck
```

## 许可证

MIT
