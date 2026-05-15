import whisper
import os
from pathlib import Path
from app.core.config import settings

class MultimediaService:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if self.model is None:
            self.model = whisper.load_model(settings.whisper_model)
        return self.model

    async def transcribe(self, file_path: Path) -> dict:
        model = self._load_model()
        result = model.transcribe(str(file_path))
        
        # Simple chapter detection or just returning segments
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"],
                "speaker": "SPEAKER_00"  # Whisper doesn't do diarization natively without extra steps
            })
            
        return {
            "transcript": result["text"],
            "segments": segments,
            "chapters": [{"title": "Introduction", "start": 0.0}] # Simplified
        }

multimedia_service = MultimediaService()
