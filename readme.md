# LeetCode Agent

一个基于 **React + Express + Gemini** 的智能刷题应用，支持题目筛选、在线编码、AI 解析和中英文切换。

## 当前进展（更新于 2026-02-11）

- 已完成前后端联通：前端可调用后端获取题目与 Gemini 分析结果
- 已完成习惯配置页：支持策略、题量、模式、语言配置
- 已完成刷题页：左侧题目信息 + 右侧 Monaco 编辑器
- 已接入 Gemini 调用链路：`frontend -> /api/gemini -> call_gemini.py`
- 已支持中英文展示：前端可按 `zh/en` 切换展示内容
- 已提供一键启动脚本：`start.bat`（Windows）、`start.sh`（macOS/Linux）

## 快速运行

### 1. 环境准备

- Node.js >= 18
- Python >= 3.9
- 本地存在 Gemini Key（建议放在项目根目录 `.gmini_api_key`）

### 2. 一键启动（推荐）

Windows（PowerShell）：

```powershell
cd d:\GitHubRepo\leetcode-agent1
.\start.bat
```

macOS / Linux：

```bash
cd /path/to/leetcode-agent1
chmod +x start.sh
./start.sh
```

启动后访问：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`

### 3. 手动启动（脚本不可用时）

后端（终端 1）：

```bash
cd server
npm install
npm start
```

前端（终端 2）：

```bash
cd frontend
npm install
npm run dev
```

Python 依赖（仅在直接运行 Python 脚本时需要）：

```bash
pip install -r requirements.txt
```

## 目录说明

- `frontend/`：React + Vite 前端
- `server/`：Express 后端
- `call_gemini.py`：Gemini Python 调用脚本
- `leetcode_hot100_full.json`：题库数据
- `start.bat` / `start.sh`：快速启动脚本

## 详细文档

- 快速指南：`QUICK_START.md`
- 完整说明：`README_FULL.md`

## CV Project Description (Multi-Agent)

This project is a local multi-agent LeetCode assistant where strategy planning, problem generation, answer evaluation, and review scheduling are coordinated as specialized modules.  
It persists per-question artifacts, including generated solutions, user submissions, analysis results, completion state, and first-pass/review timestamps, without requiring a database.  
The workflow supports bilingual module-level regeneration and closed-loop feedback, enabling iterative learning instead of one-shot AI responses.
