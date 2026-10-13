"""Pydantic schemas for the AI Financial Advisor domain."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ResponseActionCard(BaseModel):
    """UI interactive action card matching frontend ResponseActionCard."""
    title: str = Field(..., description="Card headline")
    description: str = Field(..., description="Card summary text")
    action_label: str = Field(..., alias="actionLabel", description="Button text")
    action_path: str = Field(..., alias="actionPath", description="Internal navigation route")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AdvisorChatRequest(BaseModel):
    """Payload for asking the AI Advisor a question."""
    message: str = Field(..., min_length=1, max_length=2000, description="User question or financial prompt")
    conversation_id: Optional[str] = Field(default=None, alias="conversationId", description="Optional conversation identifier")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AdvisorMetadata(BaseModel):
    """Safe telemetry and audit metadata for the advisor response."""
    intent: str
    provider: str
    model: str
    latency_ms: float
    sources: List[str]
    fallback_used: bool = False

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AdvisorMessage(BaseModel):
    """Structured response schema matching frontend AdvisorMessage."""
    id: str
    role: Literal["user", "assistant"] = "assistant"
    content: str
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).strftime("%I:%M %p"),
        description="Display timestamp",
    )
    status: Literal["sending", "sent", "error"] = "sent"
    action_card: Optional[ResponseActionCard] = Field(default=None, alias="actionCard")

    # Rich provenance and safety fields
    intent: Optional[str] = None
    sources: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    disclaimer: str = Field(
        default="AI Financial Advisor provides educational financial insights and calculations based on your synced data. Not certified financial or tax advice.",
    )
    metadata: Optional[AdvisorMetadata] = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AdvisorLLMResponse(BaseModel):
    """Structured schema for LLM outputs."""
    content: str = Field(..., description="Natural language educational explanation")
    reasoning: List[str] = Field(default_factory=list, description="Logical analysis points")
    facts_used: List[str] = Field(default_factory=list, description="Verified facts from financial context")
    recommendations: List[str] = Field(default_factory=list, description="Actionable educational suggestions")
    action_card: Optional[ResponseActionCard] = None
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    warnings: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
