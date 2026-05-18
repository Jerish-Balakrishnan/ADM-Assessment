from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed():
    db = SessionLocal()
    # Check if we already have data
    if db.query(models.AIResponse).count() > 0:
        print("Database already seeded.")
        return

    # Seed with some Q&A pairs
    seed_data = []
    for i in range(1, 13): # Create 12 pairs (24 items total)
        # The Question
        seed_data.append(models.AIResponse(
            summary=f"Sample Question {i}",
            response_text=f"How does the system handle query number {i}?",
            category="Question",
            confidence_score="N/A"
        ))
        # The Answer
        seed_data.append(models.AIResponse(
            summary=f"Sample Answer {i}",
            response_text=f"The AI has analyzed query {i} and determined a confidence of {0.85 + (i/100):.2f}.",
            category="Answer",
            confidence_score=f"{0.85 + (i/100):.2f}"
        ))

    db.add_all(seed_data)
    db.commit()
    print("Database seeded with 24 Q&A entries.")
    db.close()

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    seed()
