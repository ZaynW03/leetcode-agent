import os
import json
import getpass
import argparse
import sys
from pathlib import Path

# 强制 Python 使用 UTF-8 输出
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def _get_api_key(provided_key=None, key_file=None):
    """
    双重判断读取 API key 的逻辑：
    1. 如果指定并存在 `key_file`，优先读取该文件内容并返回。
    2. 然后检查函数参数 `provided_key`。
    3. 再检查环境变量 `GMINI_API_KEY`。
    4. 最后交互式询问输入。
    """
    # 1) 检查文件
    if key_file:
        p = Path(key_file).expanduser()
        if p.is_file():
            return p.read_text(encoding='utf-8').strip()

    # 2) 参数优先
    if provided_key:
        return provided_key

    # 3) 环境变量
    env_key = os.getenv('GMINI_API_KEY')
    if env_key:
        return env_key

    # 4) 交互式提示（隐藏输入）
    return getpass.getpass('Enter Gemini API key (or set GMINI_API_KEY): ').strip()


def call_api(feature='default', api_key=None, model_name='gemini-3-flash-preview', user_query=None, dry_run=False, key_file=None):
    """
    调用 Gemini 的封装函数。
    - feature: 指定 Gemini 回复中包含的 feature 描述（默认 'default'）。
    - api_key: 优先级：参数 > 环境变量 GMINI_API_KEY > 交互式输入。
    - model_name: 使用的模型名称。
    - user_query: 要发送给模型的用户问题，如果为 None 则使用默认示例。
    - dry_run: True 则仅返回生成的 prompt（不发起网络调用）。
    返回 Python dict（解析自模型输出 JSON）或包含 prompt 的 dict（dry_run）。
    """
    if user_query is None:
        user_query = '给我逆序链表两数之和的算法解析'

    prompt = f"""
# Role
你是一个前端内容分发专家，负责将复杂的信息转化为结构化的 JSON 格式，以便直接对接 UI 组件。

# Task
请分析并回复用户的问题，但必须遵循以下【输出格式】要求：
1. 必须输出且仅输出一个合法的 JSON 对象。
2. 不要包含任何 Markdown 的代码块标签（如 ```json ）。
3. 文本内容请使用适合前端显示的 Markdown 语法（如加粗、行内代码）。
4. title、subtitle、content 字段必须包含中文版本（作为主要内容）和英文版本。
   格式: "中文内容\\n\\n---\\n\\n English Content"
5. 如果有代码，请也提供对应的注释版本。

# Feature
{feature}

# JSON Structure Example
{{
  "status": "success",
  "data": {{
    "title": "中文标题\\n\\n---\\n\\nEnglish Title",
    "subtitle": "中文副标题\\n\\n---\\n\\nEnglish Subtitle",
    "content": "中文正文内容\\n\\n---\\n\\nEnglish Content",
    "tags": ["标签1", "Tag1"],
    "code": "// solution code here",
    "action_button": "查看代码\\n\\n---\\n\\nView Code",
    "metadata": {{
      "word_count": 120,
      "priority": "high"
    }}
  }}
}}

# User Query
[{user_query}]
""".strip()

    if dry_run:
        return {'prompt': prompt}

    # 延迟导入以便在 dry_run 环境下不依赖外部包
    try:
        import google.generativeai as genai
    except Exception as e:
        raise RuntimeError('需要安装 google-generativeai，或在 dry_run 模式下运行。') from e

    key = _get_api_key(api_key, key_file=key_file)
    if not key:
        raise ValueError('API key not provided. Set GMINI_API_KEY or pass api_key parameter.')

    genai.configure(api_key=key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    # 期望模型返回严格的 JSON 文本
    return json.loads(response.text)


def main():
    parser = argparse.ArgumentParser(description='Call Gemini and get structured JSON output.')
    parser.add_argument('--feature', default='default', help='Feature text to include in the prompt')
    parser.add_argument('--api-key', default=None, help='Gemini API key (overrides GMINI_API_KEY)')
    parser.add_argument('--model', default='gemini-3-flash-preview', help='Model name to use')
    parser.add_argument('--query', default=None, help='User query to send')
    parser.add_argument('--dry-run', action='store_true', help='Only print the generated prompt (no network call)')
    parser.add_argument('--key-file', default='.gmini_api_key', help='Path to local API key file (checked first)')

    args = parser.parse_args()

    try:
        result = call_api(feature=args.feature, api_key=args.api_key, model_name=args.model, user_query=args.query, dry_run=args.dry_run, key_file=args.key_file)
    except Exception as e:
        print('Error:', e)
        return

    print('---- Result ----')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
