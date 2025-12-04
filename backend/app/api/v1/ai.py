from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class AIQuery(BaseModel):
    query: str
    context: str | None = None

@router.post("/chat")
async def chat(query: AIQuery):
    """
    Placeholder for AI Chat endpoint.
    """
    return {"response": "AI Assistant is currently under maintenance. Please try again later."}

@router.get("/status")
async def status():
    return {"status": "active", "provider": "disabled"}
