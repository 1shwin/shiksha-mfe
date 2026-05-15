import json, re, httpx
from app.core.config import settings

class LlmClient:
    def _repair_json(self, raw: str) -> dict:
        """Attempt to fix common LLM JSON issues."""
        # Strip markdown fences
        raw = re.sub(r'^```json\s*', '', raw.strip())
        raw = re.sub(r'\s*```$', '', raw.strip())
        # Try direct parse
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
        # Try extracting first {...} or [...]
        match = re.search(r'(\{.*\}|\[.*\])', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f'Could not parse LLM output as JSON: {raw[:200]}')

    async def generate_json(self, prompt: str, retries: int = 2) -> dict:
        last_error = None
        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient(timeout=120) as client:
                    resp = await client.post(
                        f'{settings.ollama_api_url}/api/generate',
                        json={'model': settings.llm_model, 'prompt': prompt,
                              'format': 'json', 'stream': False},
                    )
                    resp.raise_for_status()
                    return self._repair_json(resp.json()['response'])
            except Exception as exc:
                last_error = exc
                if attempt < retries:
                    prompt += '\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a JSON object, no markdown, no explanation.'
        raise RuntimeError(f'LLM failed after {retries+1} attempts: {last_error}')

llm_client = LlmClient()
