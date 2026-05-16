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
        
        # 1. Ingestion / Analysis (Takeaways & Glossary) - CHECK FIRST to avoid keyword overlap with source text
        if "takeaways" in prompt_lower or "glossary" in prompt_lower:
            return {
                "takeaways": [
                    {"title": "Energy Conversion", "summary": "Photosynthesis is the vital process where plants convert solar energy into chemical energy (glucose).", "pageRef": "1", "confidence": 0.99},
                    {"title": "Oxygen Production", "summary": "As a byproduct of photosynthesis, plants release oxygen, which is essential for most life forms on Earth.", "pageRef": "2", "confidence": 0.95}
                ],
                "glossary": [
                    {
                        "term": "Chloroplast", 
                        "definition": "An organelle in plant cells that contains chlorophyll and is the site of photosynthesis.", 
                        "context": "Plant Biology",
                        "latex": "\\text{Chloroplasts} \\subset \\text{Plant Cells}"
                    },
                    {
                        "term": "Photosynthesis Equation", 
                        "definition": "The chemical equation for photosynthesis.", 
                        "context": "Biochemistry",
                        "latex": "6CO_2 + 6H_2O + \\text{light} \\to C_6H_{12}O_6 + 6O_2"
                    },
                    {
                        "term": "Stomata", 
                        "definition": "Microscopic pores on the surface of leaves that allow for gas exchange (CO2 in, O2 out).", 
                        "context": "Plant Anatomy"
                    }
                ],
                "narration_script": "Welcome to our lesson on Photosynthesis. Today we will learn how plants create their own food using sunlight."
            }

        # 2. Assessment / Questions / Quiz
        if "assessment" in prompt_lower or "question" in prompt_lower or "quiz" in prompt_lower:
            return {
                "questions": [
                    {
                        "question": "What pigment gives leaves their green color and absorbs light energy?",
                        "latex": "\\text{Pigment} = \\text{Chlorophyll}",
                        "answers": [
                            {"text": "Chlorophyll", "correct": True, "feedback": "Correct! Chlorophyll is the key pigment in photosynthesis."},
                            {"text": "Melanin", "correct": False, "feedback": "Incorrect. Melanin is found in animals."},
                            {"text": "Carotene", "correct": False, "feedback": "Incorrect. Carotene is orange/red."}
                        ],
                        "explanation": "Chlorophyll is located in chloroplasts and absorbs light energy to drive photosynthesis.",
                        "difficulty": "easy",
                        "bloomsLevel": "remember",
                        "evidence": {"quote": "Chlorophyll is the green pigment responsible for capturing light energy.", "pageRef": "1"}
                    },
                    {
                        "question": "What are the primary products of photosynthesis?",
                        "latex": "6CO_2 + 6H_2O \\xrightarrow{\\text{light}} C_6H_{12}O_6 + 6O_2",
                        "answers": [
                            {"text": "Glucose and Oxygen", "correct": True, "feedback": "Correct! These are the outputs of the chemical equation."},
                            {"text": "Carbon Dioxide and Water", "correct": False, "feedback": "Incorrect. These are the reactants."},
                            {"text": "ATP and Nitrogen", "correct": False, "feedback": "Incorrect."}
                        ],
                        "explanation": "Plants use CO2 and H2O to produce Glucose (energy) and Oxygen (byproduct).",
                        "difficulty": "medium",
                        "bloomsLevel": "understand",
                        "evidence": {"quote": "Plants convert carbon dioxide and water into glucose and oxygen.", "pageRef": "2"}
                    }
                ]
            }

        # 3. Lesson Slides / Micro-Lesson
        if "slide" in prompt_lower or "lesson slides" in prompt_lower:
            return {
                "slides": [
                    {
                        "id": "s1",
                        "title": "Introduction to Photosynthesis",
                        "body": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water."
                    },
                    {
                        "id": "s2",
                        "title": "The Role of Chlorophyll",
                        "body": "Chlorophyll is the green pigment responsible for capturing light energy. It is found in the chloroplasts of plant cells."
                    },
                    {
                        "id": "s3",
                        "title": "The Chemical Equation",
                        "body": "6CO2 + 6H2O + Light Energy → C6H12O6 + 6O2. Plants convert carbon dioxide and water into glucose and oxygen."
                    },
                    {
                        "id": "s4",
                        "title": "Importance for Earth",
                        "body": "Photosynthesis is crucial for life on Earth. It provides the oxygen we breathe and forms the base of the food web."
                    }
                ]
            }
            
        # 4. Summary
        if "summarize" in prompt_lower or "summary" in prompt_lower:
            return {
                "summary": "Photosynthesis is a fundamental biological process where sunlight is converted into chemical energy, producing oxygen and glucose from carbon dioxide and water.",
                "key_points": [
                    "Occurs in chloroplasts",
                    "Requires sunlight, CO2, and water",
                    "Produces O2 as a byproduct"
                ]
            }

        # 5. Flashcards
        if "flashcard" in prompt_lower:
            return {
                "flashcards": [
                    {"front": "What does SSE stand for?", "back": "Server-Sent Events"},
                    {"front": "What is FastAPI?", "back": "A modern, fast web framework for building APIs with Python."}
                ]
            }

        return {"message": "Generic mock response", "status": "ok", "note": "Add more keyword handlers to llm_client.py if needed."}

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
