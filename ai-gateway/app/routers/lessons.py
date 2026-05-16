from fastapi import APIRouter, HTTPException
from app.models.schemas import MicroLessonRequest, MicroLessonResponse
from app.services.lesson_service import build_lesson
from app.services.review_service import approve, publish, read_status

router = APIRouter()

@router.post('/generate', response_model=MicroLessonResponse)
async def generate_lesson(request: MicroLessonRequest):
    result = await build_lesson(request.title, request.source_text, request.branding)
    return result

@router.post('/{lesson_id}/approve')
def approve_lesson(lesson_id: str):
    try:
        return {'lesson_id': lesson_id, 'status': approve(lesson_id)}
    except FileNotFoundError:
        raise HTTPException(404, 'Lesson not found')

@router.post('/{lesson_id}/publish')
def publish_lesson(lesson_id: str):
    try:
        return {'lesson_id': lesson_id, 'status': publish(lesson_id)}
    except FileNotFoundError:
        raise HTTPException(404, 'Lesson not found')
    except PermissionError as e:
        raise HTTPException(409, str(e))

@router.get('/{lesson_id}/status')
def lesson_status(lesson_id: str):
    try:
        return {'lesson_id': lesson_id, 'status': read_status(lesson_id)}
    except FileNotFoundError:
        raise HTTPException(404, 'Lesson not found')
