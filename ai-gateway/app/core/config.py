from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    app_name: str = 'Shiksha AI Gateway'
    ollama_api_url: str = 'http://ollama:11434'
    llm_model: str = 'mistral'          # Mistral only, no fallback
    redis_url: str = 'redis://redis:6379/0'
    artifact_root: Path = Path('/tmp/shiksha-ai-artifacts')
    temp_root: Path = Path('/tmp/shiksha-ai')
    whisper_model: str = 'large-v3'

settings = Settings()
settings.artifact_root.mkdir(parents=True, exist_ok=True)
settings.temp_root.mkdir(parents=True, exist_ok=True)
