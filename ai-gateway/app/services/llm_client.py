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

    def _get_mock_response(self, prompt: str) -> dict:
        """Return static mock data based on the prompt content."""
        prompt_lower = prompt.lower()
        if "takeaways" in prompt_lower or "glossary" in prompt_lower:
            return {
                "takeaways": [
                    {"title": "Key Concept", "summary": "This is a mock takeaway generated in mock mode.", "pageRef": "1", "confidence": 0.95}
                ],
                "glossary": [
                    {"term": "Mock Term", "definition": "A term used for testing without an LLM.", "context": "Testing environment"}
                ],
                "narration_script": "This is a mock narration script."
            }
        if "assessment" in prompt_lower or "questions" in prompt_lower:
            return {
                "questions": [
                    {
                        "question": "What is the capital of France?",
                        "answers": [
                            {"text": "Paris", "correct": True, "feedback": "Correct!"},
                            {"text": "London", "correct": False, "feedback": "Incorrect."}
                        ],
                        "explanation": "Paris is the capital of France.",
                        "difficulty": "easy",
                        "bloomsLevel": "remember",
                        "evidence": {"quote": "This is a mock quote that must be in the source text to pass validation.", "pageRef": "1"}
                    }
                ]
            }
        return {"message": "Generic mock response", "status": "ok"}

    async def generate_json(self, prompt: str, retries: int = 2) -> dict:
        if settings.mock_mode:
            return self._get_mock_response(prompt)
            
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
