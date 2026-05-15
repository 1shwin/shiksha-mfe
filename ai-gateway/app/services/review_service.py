from app.models.schemas import LessonStatus
from fastapi import HTTPException

class ReviewService:
    def __init__(self):
        # In-memory storage for demo purposes, replace with DB in production
        self._lessons = {}

    def get_status(self, lesson_id: str) -> LessonStatus:
        return self._lessons.get(lesson_id, LessonStatus.draft)

    def approve(self, lesson_id: str):
        status = self.get_status(lesson_id)
        if status == LessonStatus.published:
            raise HTTPException(status_code=400, detail="Already published")
        self._lessons[lesson_id] = LessonStatus.approved

    def publish(self, lesson_id: str):
        status = self.get_status(lesson_id)
        if status != LessonStatus.approved:
            raise HTTPException(status_code=409, detail="Lesson must be approved before publishing")
        self._lessons[lesson_id] = LessonStatus.published

review_service = ReviewService()
