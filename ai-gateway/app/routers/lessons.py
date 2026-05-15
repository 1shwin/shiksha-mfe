from fastapi import APIRouter, HTTPException
from app.models.schemas import LessonStatus, MicroLessonResponse, Branding
from app.services.review_service import review_service
import uuid
import time

router = APIRouter()

@router.post("/generate", response_model=MicroLessonResponse)
async def generate_lesson(title: str, source_text: str, branding: Branding):
    start_time = time.time()
    lesson_id = str(uuid.uuid4())
    
    # Mock generation logic
    processing_ms = int((time.time() - start_time) * 1000)
    
    return MicroLessonResponse(
        lesson_id=lesson_id,
        status=LessonStatus.draft,
        file_paths={"h5p": f"/artifacts/{lesson_id}.h5p"},
        xapi_events=[],
        generation_ms=processing_ms
    )

@router.post("/{id}/approve")
async def approve_lesson(id: str):
    review_service.approve(id)
    return {"status": "approved", "lesson_id": id}

@router.post("/{id}/publish")
async def publish_lesson(id: str):
    review_service.publish(id)
    return {"status": "published", "lesson_id": id}
