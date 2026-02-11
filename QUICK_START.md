# 🚀 快速启动指南

## 一句话总结
这是一个 **React + Express + Gemini** 的全栈刷题应用，支持实时代码编辑、AI 分析和中英文切换。

## 30 秒快速开始

### Windows
```powershell
cd d:\GitHubRepo\leetcode-agent1
.\start.bat
```
然后打开浏览器访问 `http://localhost:5173`

### macOS / Linux
```bash
cd /path/to/leetcode-agent1
chmod +x start.sh
./start.sh
```

## 如果启动脚本不工作，手动启动：

### 后端（终端 1）
```bash
cd server
npm install  # 首次运行必需
npm start
```

### 前端（终端 2）
```bash
cd frontend
npm install  # 首次运行必需
npm run dev
```

## 系统要求
- ✅ Node.js >= 18
- ✅ Python >= 3.9
- ✅ 已生成的 `.gmini_api_key` 文件（包含 Gemini API Key）

## 工作流程

1. **打开** → http://localhost:5173
2. **配置** → 选择刷题策略、数目、模式、语言
3. **开始** → 左边看题目，右边编代码
4. **提交** → Gemini 给出详细分析
5. **语言** → 右上角切换中英文

## 关键功能

| 功能 | 说明 |
|------|------|
| 题目筛选 | 从 JSON 按策略导出 1-3 道题 |
| 代码编辑 | Monaco Editor，自动缩进、语法高亮 |
| AI 分析 | 实时调用 Gemini 获取解析 |
| 中英文 | 顶部按钮一键切换 |

## 端口占用排查

如果端口已被占用，修改：
- 前端端口：编辑 `frontend/vite.config.js` 的 `server.port`
- 后端端口：编辑 `server/index.js` 的 `PORT` 并在 `frontend/src/utils/api.js` 更新 `API_BASE`

## 项目文件说明

详见 [README_FULL.md](./README_FULL.md)

---

📧 如有问题，检查浏览器控制台 Console / 后端服务器日志。
