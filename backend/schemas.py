import uuid
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PromptRequest(BaseModel):
    prompt: str
    targetLanguage: str
    contextId: Optional[uuid.UUID] = None

class ResponseSchema(BaseModel):
    id: int
    summary: str
    response_text: str
    category: str
    confidence_score: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginationMetadata(BaseModel):
    total: int
    page: int
    size: int
    pages: int

class SuccessResponse(BaseModel):
    status: str = "SUCCESS"
    insights: List[ResponseSchema]
    pagination: Optional[PaginationMetadata] = None

class ClarificationResponse(BaseModel):
    status: str = "NEEDS_CLARIFICATION"
    message: str

class SubmitResponse(BaseModel):
    status: str
    message: str
    contextId: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
