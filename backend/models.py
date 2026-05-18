from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class AIResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(Integer, primary_key=True, index=True)
    summary = Column(String(255), index=True) # Short summary of the response
    response_text = Column(Text) # The full AI generated content
    category = Column(String(100)) # e.g., Analysis, Recommendation
    confidence_score = Column(String(50)) # e.g., 0.95
    context_id = Column(String(36), index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PromptHistory(Base):
    __tablename__ = "prompt_history"

    id = Column(Integer, primary_key=True, index=True)
    user_prompt = Column(Text)
    target_language = Column(String(10))
    context_id = Column(String(36), nullable=True)
    status = Column(String(50)) 
    response_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
