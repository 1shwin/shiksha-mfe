from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.multimedia_service import multimedia_service
from app.core.config import settings
import uuid
import shutil

router = APIRouter()

@router.post("/transcribe")
async def transcribe_media(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1].lower()
    
    if ext not in ["mp4", "wav", "mp3"]:
        raise HTTPException(status_code=400, detail="Unsupported media format")
    
    temp_path = settings.temp_root / f"{file_id}.{ext}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    result = await multimedia_service.transcribe(temp_path)
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "transcript": result["transcript"],
        "transcript_path": f"/artifacts/{file_id}.txt",
        "vtt_path": f"/artifacts/{file_id}.vtt",
        "segments": result["segments"],
        "chapters": result["chapters"]
    }
