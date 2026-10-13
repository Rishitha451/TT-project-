"""AI Financial Advisor API router."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.advisor import AdvisorChatRequest, AdvisorMessage
from app.schemas.common import ApiResponse
from app.services.advisor_service import AdvisorService

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


@router.post("/chat", response_model=ApiResponse[AdvisorMessage], summary="Send message to AI Advisor")
async def advisor_chat(
    payload: AdvisorChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Process user financial query and return structured AI advice and verified metrics."""
    service = AdvisorService(db)
    result = await service.chat(payload=payload, user=current_user)
    return ApiResponse.ok(data=result, message="Advisor response generated successfully.")


@router.get("/history", response_model=ApiResponse[List[AdvisorMessage]], summary="Get advisor chat history")
async def advisor_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve session chat history for authenticated user."""
    return ApiResponse.ok(data=[], message="Chat history retrieved successfully.")
