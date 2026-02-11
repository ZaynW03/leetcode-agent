import argparse
import getpass
import json
import os
from pathlib import Path


def _get_api_key(provided_key=None, key_file=None):
    if key_file:
        p = Path(key_file).expanduser()
        if p.is_file():
            return p.read_text(encoding='utf-8').strip()

    if provided_key:
        return provided_key

    env_key = os.getenv('GMINI_API_KEY')
    if env_key:
        return env_key

    return getpass.getpass('Enter Gemini API key (or set GMINI_API_KEY): ').strip()


def _extract_json(text):
    text = (text or '').strip()
    if not text:
        raise ValueError('Gemini returned empty output')

    start = text.find('{')
    end = text.rfind('}')
    if start == -1 or end == -1 or start > end:
        raise ValueError('No JSON object found in Gemini output')

    return json.loads(text[start:end + 1])


def build_generate_prompt(feature, user_query, module):
    module_rule = (
        f'Primary refresh target: {module}. Keep this part especially strong and concrete.'
        if module
        else 'Generate a full answer package.'
    )

    return f"""
You are an algorithm interview coach.

Return exactly one valid JSON object. No markdown code fence.

Output schema:
{{
  "status": "success",
  "data": {{
    "title": "Chinese\\n\\n---\\n\\nEnglish",
    "subtitle": "Chinese\\n\\n---\\n\\nEnglish",
    "content": "Chinese\\n\\n---\\n\\nEnglish",
    "localized": {{
      "zh": {{
        "title": "纯中文标题",
        "subtitle": "纯中文副标题",
        "content": "纯中文正文"
      }},
      "en": {{
        "title": "English title",
        "subtitle": "English subtitle",
        "content": "English content"
      }}
    }},
    "tags": ["tag1", "tag2"],
    "code": "single code block string only"
  }}
}}

Rules:
1) Keep wording clear and direct. Use short paragraphs and explicit steps.
2) For content: include problem understanding, key idea, algorithm steps, complexity, and edge cases.
3) For code: output only one clean implementation in the requested programming language.
4) Chinese and English must both be present in title/subtitle/content, split by "\\n\\n---\\n\\n".
5) You MUST also fill data.localized.zh.* and data.localized.en.* keys with clear plain text.
6) tags should be short and useful.
7) {module_rule}

Feature context:
{feature}

User question:
[{user_query}]
""".strip()


def build_judge_prompt(feature, user_query):
    return f"""
You are a strict coding interview evaluator.

Return exactly one valid JSON object. No markdown code fence.

Output schema:
{{
  "status": "success",
  "data": {{
    "runnable": true,
    "ideaCorrect": true,
    "complexityScore": 1,
    "summary": "Chinese\\n\\n---\\n\\nEnglish",
    "issues": ["Chinese\\n\\n---\\n\\nEnglish"],
    "suggestions": ["Chinese\\n\\n---\\n\\nEnglish"],
    "fixedCode": "optional improved code, same language as submission"
  }}
}}

Rules:
1) runnable=true only when the code is syntactically valid and likely to run.
2) ideaCorrect=true when core algorithm direction is right, even if code has bugs.
3) complexityScore must be:
   - 1: only barely solves / brute force / poor generalization
   - 2: generally correct and reusable
   - 3: optimal or near-optimal for this problem
4) If runnable=false, provide concrete fix steps and a corrected code draft in fixedCode.
5) Keep wording clear and direct. No fluff.
6) summary/issues/suggestions must all include Chinese and English split by "\\n\\n---\\n\\n".

Feature context:
{feature}

User submission:
[{user_query}]
""".strip()


def call_api(feature='default', api_key=None, model_name='gemini-3-flash-preview', user_query=None, dry_run=False, key_file=None, module=None, task='generate'):
    if user_query is None:
        user_query = 'Explain the Two Sum problem and give a solution.'

    if task == 'judge':
        prompt = build_judge_prompt(feature=feature, user_query=user_query)
    else:
        prompt = build_generate_prompt(feature=feature, user_query=user_query, module=module)

    if dry_run:
        return {'prompt': prompt}

    try:
        import google.generativeai as genai
    except Exception as e:
        raise RuntimeError('google-generativeai is required. Install dependencies first.') from e

    key = _get_api_key(api_key, key_file=key_file)
    if not key:
        raise ValueError('API key not provided. Set GMINI_API_KEY or pass --api-key.')

    genai.configure(api_key=key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    return _extract_json(response.text)


def main():
    parser = argparse.ArgumentParser(description='Call Gemini and get structured JSON output.')
    parser.add_argument('--feature', default='default', help='Feature text to include in the prompt')
    parser.add_argument('--api-key', default=None, help='Gemini API key (overrides GMINI_API_KEY)')
    parser.add_argument('--model', default='gemini-3-flash-preview', help='Model name to use')
    parser.add_argument('--query', default=None, help='User query to send')
    parser.add_argument('--module', default=None, help='Target module to refresh, e.g. content/code')
    parser.add_argument('--task', default='generate', choices=['generate', 'judge'], help='Task type')
    parser.add_argument('--dry-run', action='store_true', help='Only print the generated prompt')
    parser.add_argument('--key-file', default='.gmini_api_key', help='Path to local API key file')
    args = parser.parse_args()

    result = call_api(
        feature=args.feature,
        api_key=args.api_key,
        model_name=args.model,
        user_query=args.query,
        dry_run=args.dry_run,
        key_file=args.key_file,
        module=args.module,
        task=args.task,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
