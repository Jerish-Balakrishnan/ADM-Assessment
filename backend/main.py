import uuid
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import math

import models
import schemas
import uvicorn
from database import engine, Base, get_db

from fastapi.responses import JSONResponse

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Middleware API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_LANGUAGES = ["en", "es", "fr"]

@app.post("/api/submit", response_model=schemas.ClarificationResponse | schemas.SubmitResponse)
async def submit_prompt(
    request: schemas.PromptRequest, 
    db: Session = Depends(get_db)
):
    # 1. Basic Validation
    if not request.prompt.strip():
        return JSONResponse(
            status_code=400,
            content={"error": "MISSING_PROMPT", "message": "Prompt is required"}
        )
    
    if request.targetLanguage not in SUPPORTED_LANGUAGES:
        return JSONResponse(
            status_code=400,
            content={"error": "INVALID_LANGUAGE", "message": "Target language is not supported"}
        )

    # 2. Clarification Logic
    if len(request.prompt.strip()) < 5:
        # Log to history
        history = models.PromptHistory(
            user_prompt=request.prompt,
            target_language=request.targetLanguage,
            context_id=str(request.contextId) if request.contextId else None,
            status="NEEDS_CLARIFICATION",
            response_message="Please provide more details"
        )
        db.add(history)
        db.commit()
        return schemas.ClarificationResponse(message="Please provide more details")

    # 3. Simulate AI Call & Save Interaction to DB
    actual_context_id = request.contextId or uuid.uuid4()
    str_context_id = str(actual_context_id)

    # Save prompt to history
    history = models.PromptHistory(
        user_prompt=request.prompt,
        target_language=request.targetLanguage,
        context_id=str_context_id,
        status="SUCCESS"
    )
    db.add(history)

    # 1. Save the User's Prompt as a "Question" entry
    user_question = models.AIResponse(
        summary=f"User Query: {request.prompt[:30]}...",
        response_text=request.prompt,
        category="Question",
        confidence_score="N/A",
        context_id=str_context_id
    )
    db.add(user_question)

    # 2. Save the AI's output as an "Answer" entry
    ai_answer = models.AIResponse(
        summary=f"AI Response for {request.prompt[:15]}...",
        response_text=f"The AI has processed your request in {request.targetLanguage}. Based on the input '{request.prompt}', the recommended action is to proceed with standard analysis protocols.",
        category="Answer",
        confidence_score="0.96",
        context_id=str_context_id
    )
    db.add(ai_answer)
    
    db.commit()

    return schemas.SubmitResponse(
        status="SUCCESS",
        message="Interaction recorded. Question and Answer have been saved to the database.",
        contextId=str_context_id
    )

@app.get("/api/insights", response_model=schemas.SuccessResponse)
async def get_insights(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    contextId: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.AIResponse).order_by(models.AIResponse.id.desc())
    
    # Filter by context if provided (optional)
    if contextId:
        query = query.filter(models.AIResponse.context_id == contextId)
    
    total_count = query.count()
    offset = (page - 1) * size
    insights = query.offset(offset).limit(size).all()
    
    pagination = schemas.PaginationMetadata(
        total=total_count,
        page=page,
        size=size,
        pages=math.ceil(total_count / size) if total_count > 0 else 1
    )

    return schemas.SuccessResponse(
        insights=insights,
        pagination=pagination
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
