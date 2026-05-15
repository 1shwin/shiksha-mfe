import whisper
import os
from pathlib import Path
from app.core.config import settings

class MultimediaService:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if settings.mock_mode:
            return None
        if self.model is None:
            self.model = whisper.load_model(settings.whisper_model)
        return self.model

    async def transcribe(self, file_path: Path) -> dict:
        if settings.mock_mode:
            return {
                "transcript": "This is a mock transcript for testing in mock mode.",
                "segments": [
                    {"start": 0.0, "end": 5.0, "text": "This is a mock transcript", "speaker": "SPEAKER_00"}
                ],
                "chapters": [{"title": "Introduction", "start": 0.0}]
            }
            
        model = self._load_model()
        result = model.transcribe(str(file_path))
        
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"],
                "speaker": "SPEAKER_00"
            })
            
        return {
            "transcript": result["text"],
            "segments": segments,
            "chapters": [{"title": "Introduction", "start": 0.0}]
        }

multimedia_service = MultimediaService()
