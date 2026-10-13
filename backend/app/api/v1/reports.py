from fastapi import APIRouter
from ...schemas.common import ApiResponse, PlaceholderResponse
from ...core.exceptions import NotImplementedDomainException

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=ApiResponse[PlaceholderResponse], summary="List Reports (Placeholder)")
async def list_reports():
    raise NotImplementedDomainException("Reports list endpoint will be implemented in Phase 7C.")


@router.post("/generate", response_model=ApiResponse[PlaceholderResponse], summary="Generate Report (Placeholder)")
async def generate_report():
    raise NotImplementedDomainException("Report generation endpoint will be implemented in Phase 7C.")
