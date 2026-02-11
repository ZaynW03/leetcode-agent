# LeetCode Agent - 智能刷题助手

一个全栈应用，帮你通过 Gemini AI 高效地刷 LeetCode 题目。

## 🎯 功能特性

### 界面1：习惯配置页面
- 选择刷题策略：**由易到难** 或 **难易交替**
- 选择练习数目：**1-3 道题**
- 选择答题模式：**解题** 或 **算法优化**
- 选择编程语言：**Python / JavaScript / Java / C++ / Go**

### 界面2：刷题页面
- **左侧**：题目描述、解题思路、参考代码
- **右侧**：代码编辑器（Monaco Editor，支持自动缩进）
- **顶部**：中英文切换按钮
- **提交按钮**：调用 Gemini API 获取详细解析

## 🛠️ 项目结构

```
leetcode-agent1/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── HabitSelection.jsx   # 界面1：习惯选择
│   │   │   ├── PracticePage.jsx     # 界面2：刷题页面
│   │   │   └── CodeEditor.jsx       # 代码编辑器组件
│   │   ├── utils/
│   │   │   └── api.js               # API 调用函数
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                   # Express 后端
│   ├── routes/
│   │   ├── questions.js      # 题目筛选 API
│   │   └── gemini.js         # Gemini 调用 API
│   ├── utils/
│   │   └── questionFilter.js # 题目筛选逻辑
│   ├── index.js              # Express 主文件
│   └── package.json
│
├── call_gemini.py            # Python Gemini 客户端（支持中英文）
├── .gmini_api_key            # 本地 API key（已加入 .gitignore）
├── .gitignore
├── requirements.txt          # Python 依赖
├── leetcode_hot100_full.json # LeetCode 题目数据
├── start.bat                 # Windows 启动脚本
└── start.sh                  # Unix/Linux/macOS 启动脚本
```

## 📦 安装与运行

### 前置条件
- Node.js >= 18
- Python >= 3.9
- npm 或 yarn

### 快速启动

#### Windows (PowerShell)
```powershell
# 运行启动脚本
.\start.bat
```
或手动启动：
```powershell
# 终端 1：启动后端
cd server
npm install
npm start

# 终端 2：启动前端
cd frontend
npm install
npm run dev
```

#### macOS / Linux
```bash
# 运行启动脚本
chmod +x start.sh
./start.sh
```

### 手动安装依赖

**Python 依赖**：
```bash
pip install -r requirements.txt
```

**后端依赖**：
```bash
cd server
npm install
```

**前端依赖**：
```bash
cd frontend
npm install
```

## 🚀 使用流程

1. **访问应用**
   - 打开浏览器访问 `http://localhost:5173`

2. **配置习惯**
   - 选择策略、数目、模式、语言
   - 点击 "开始刷题"

3. **开始刷题**
   - 左侧查看题目信息
   - 右侧代码编辑器编写方案
   - 点击 "提交" 获取 Gemini 分析
   - 使用右上角按钮切换中英文

## 🔧 API 接口

### 获取题目列表
```
POST /api/questions
Body: {
  strategy: "easyToHard" | "alternate",
  quantity: 1 | 2 | 3,
  mode: "solving" | "optimization",
  language: "python" | "javascript" | "java" | "cpp" | "go"
}
Response: [{ id, title, difficulty, category }, ...]
```

### 调用 Gemini
```
POST /api/gemini
Body: {
  query: "题目 title",
  mode: "solving" | "optimization",
  language: "python" | ...,
  answer: "用户代码",
  lang: "zh" | "en"
}
Response: {
  status: "success",
  data: {
    title: "中文 --- English",
    content: "中文内容 --- English content",
    code: "solution code",
    ...
  }
}
```

## 🌐 中英文切换原理

- Gemini prompt 要求返回 JSON 中所有文本字段使用 `"中文 \n\n---\n\n English"` 格式
- 前端根据用户选择的语言（zh/en）分割字符串并展示相应版本

## 🔐 安全配置

API Key 存储在本地文件 `.gmini_api_key`（已加入 `.gitignore`）：
- 启动时自动从该文件读取
- 如文件不存在，会提示交互式输入
- 密钥永不暴露在浏览器

## 📝 环境变量（可选）

在系统环境中设置以下变量以覆盖文件存储：
```bash
# 设置 GMINI_API_KEY 环境变量
export GMINI_API_KEY=your_api_key_here  # macOS/Linux
set GMINI_API_KEY=your_api_key_here     # Windows CMD
$Env:GMINI_API_KEY = "your_api_key_here"  # PowerShell
```

## 🛠️ 常见问题

### 代码编辑器不显示
- 确保 CDN 连接正常（Monaco Editor 从 CDN 加载）
- 检查浏览器控制台是否有跨域错误

### Gemini API 调用失败
- 验证 API Key 是否有效
- 检查 `.gmini_api_key` 文件内容
- 查看后端日志输出

### 前端无法连接后端
- 确保后端在 `http://localhost:3001` 运行
- 检查 CORS 配置（已在 Express 中启用）

## 📚 技术栈

- **前端**：React 18 + Vite + Tailwind CSS
- **编辑器**：Monaco Editor（VS Code 同款）
- **后端**：Express.js + Node.js
- **AI**：Google Gemini API
- **Python**：google-generativeai 库

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 PR 或 Issue！
