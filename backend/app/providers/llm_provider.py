"""LLM Provider abstraction, OpenAI integration, and deterministic fallback provider."""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional, Protocol, runtime_checkable

from app.core.config import settings
from app.schemas.advisor import AdvisorLLMResponse, ResponseActionCard

logger = logging.getLogger(__name__)


@runtime_checkable
class LLMProvider(Protocol):
    """Protocol defining the interface for LLM completion providers."""

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        context_str: str,
        intent: str,
        raw_data: Dict[str, Any],
    ) -> AdvisorLLMResponse:
        """Generate structured financial advisor response."""
        ...


class DeterministicFallbackLLMProvider:
    """Production-grade deterministic advisor engine synthesizing verified facts with zero external dependencies."""

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        context_str: str,
        intent: str,
        raw_data: Dict[str, Any],
    ) -> AdvisorLLMResponse:
        """Synthesize deterministic, structured financial guidance matching the user's canonical data."""
        currency = raw_data.get("currency", "INR")
        user_name = raw_data.get("user_name", "Valued User")

        # -------------------------------------------------------------------
        # 1. Spending Analysis
        # -------------------------------------------------------------------
        if intent == "SPENDING_ANALYSIS":
            m_expense = raw_data.get("monthly_expenses", 0)
            categories = raw_data.get("categories", [])
            top_cat_text = ""
            top_cat_name = "Expenses"
            if categories:
                top_cat_name = categories[0][0]
                top_amt = categories[0][1]
                pct = (float(top_amt) / float(m_expense) * 100) if float(m_expense) > 0 else 0.0
                top_cat_text = f" Your top spending category is {top_cat_name} ({currency} {top_amt:,.2f}, {pct:.1f}% of total outflow)."

            content = (
                f"Based on your synced accounts, your total expenses this month stand at {currency} {m_expense:,.2f}."
                f"{top_cat_text} Review your category allocations to ensure your spending remains aligned with your monthly targets."
            )
            return AdvisorLLMResponse(
                content=content,
                reasoning=[
                    f"Monthly outflows calculated at {currency} {m_expense:,.2f}.",
                    f"Primary category concentration is in {top_cat_name}.",
                ],
                facts_used=[f"Total monthly expenses: {currency} {m_expense:,.2f}"],
                recommendations=["Track non-essential discretionary purchases", "Review recurring subscriptions"],
                action_card=ResponseActionCard(
                    title="Spending Breakdown",
                    description=f"Review detailed {top_cat_name} breakdown and historical trend.",
                    actionLabel="View Analytics",
                    actionPath="/app/analytics",
                ),
                confidence=0.95,
            )

        # -------------------------------------------------------------------
        # 2. Savings & Goals
        # -------------------------------------------------------------------
        elif intent in ("SAVINGS", "GOALS"):
            m_income = raw_data.get("monthly_income", 0)
            m_savings = raw_data.get("monthly_savings", 0)
            savings_rate = raw_data.get("savings_rate", 0.0)
            goals = raw_data.get("goals", [])

            goals_text = ""
            if goals:
                g = goals[0]
                pct = (float(g.current_amount) / float(g.target_amount) * 100) if float(g.target_amount) > 0 else 0.0
                goals_text = f" You are currently making steady progress on '{g.name}' ({pct:.1f}% funded: {currency} {g.current_amount:,.2f} / {currency} {g.target_amount:,.2f})."

            content = (
                f"You have a monthly savings surplus of {currency} {m_savings:,.2f}, which represents a {savings_rate:.1f}% savings rate."
                f"{goals_text} Maintaining this monthly surplus will help accelerate your milestone targets."
            )
            return AdvisorLLMResponse(
                content=content,
                reasoning=[
                    f"Current monthly cashflow surplus is {currency} {m_savings:,.2f}.",
                    f"Savings rate is {savings_rate:.1f}% of income.",
                ],
                facts_used=[f"Monthly surplus: {currency} {m_savings:,.2f}", f"Savings rate: {savings_rate:.1f}%"],
                recommendations=["Automate recurring transfers to dedicated goal funds", "Maintain 3-6 months in emergency reserves"],
                action_card=ResponseActionCard(
                    title="Goal Milestones",
                    description="Inspect and adjust milestone target dates.",
                    actionLabel="Track Goals",
                    actionPath="/app/goals",
                ),
                confidence=0.95,
            )

        # -------------------------------------------------------------------
        # 3. Investments & Portfolio
        # -------------------------------------------------------------------
        elif intent == "INVESTMENTS":
            summary = raw_data.get("investment_summary")
            positions = raw_data.get("positions", [])
            pos_count = len(positions)

            if summary and summary.total_value > 0:
                content = (
                    f"Your investment portfolio currently holds a total market value of ${summary.total_value:,.2f} across {pos_count} holdings. "
                    f"Your overall unrealized P&L is {summary.overall_pnl_pct:+.2f}% (${summary.overall_pnl:+,.2f}), with a {summary.risk_level} risk tier."
                )
            else:
                content = "You currently have no active investment positions recorded. You can add your stock and ETF holdings in the Investment Hub to track performance and risk."

            return AdvisorLLMResponse(
                content=content,
                reasoning=[
                    f"Portfolio holds {pos_count} assets." if pos_count > 0 else "Portfolio has 0 holdings.",
                ],
                facts_used=[
                    f"Total portfolio market value: ${summary.total_value:,.2f}" if summary else "No assets",
                ],
                recommendations=["Diversify across multiple asset classes", "Rebalance periodic gains"],
                action_card=ResponseActionCard(
                    title="Investment Portfolio",
                    description="View holdings, allocations, and live performance.",
                    actionLabel="Open Investment Hub",
                    actionPath="/app/investments",
                ),
                confidence=0.95,
            )

        # -------------------------------------------------------------------
        # 4. Risk Analysis
        # -------------------------------------------------------------------
        elif intent == "RISK":
            risk = raw_data.get("risk_metrics")
            if risk and risk.risk_score > 0:
                content = (
                    f"Your portfolio risk assessment indicates a {risk.risk_level} risk profile with a risk score of {risk.risk_score}/100. "
                    f"Portfolio beta is {risk.beta:.2f} with an estimated volatility index of {risk.volatility:.3f} and Sharpe ratio of {risk.sharpe_ratio:.2f}."
                )
            else:
                content = "No investment holdings are currently active to compute live volatility and beta. Add holdings in your portfolio to view real-time risk analytics."

            return AdvisorLLMResponse(
                content=content,
                reasoning=[f"Risk metrics evaluated with risk score {risk.risk_score if risk else 0}/100."],
                facts_used=[f"Risk level: {risk.risk_level if risk else 'Low'}"],
                recommendations=["Monitor single-stock concentration", "Consider index funds to balance beta"],
                action_card=ResponseActionCard(
                    title="Risk Analytics",
                    description="Inspect stress scenarios and sector exposures.",
                    actionLabel="View Risk Hub",
                    actionPath="/app/investments/risk",
                ),
                confidence=0.95,
            )

        # -------------------------------------------------------------------
        # 5. Budgeting & Planning
        # -------------------------------------------------------------------
        elif intent == "BUDGETING":
            m_income = float(raw_data.get("monthly_income", 0))
            m_expense = float(raw_data.get("monthly_expenses", 0))
            m_savings = float(raw_data.get("monthly_savings", 0))

            needs_target = m_income * 0.50
            wants_target = m_income * 0.30
            savings_target = m_income * 0.20

            content = (
                f"Under the standard 50/30/20 budget framework for your {currency} {m_income:,.2f} income:\n"
                f"• Needs (50% target): {currency} {needs_target:,.2f}\n"
                f"• Wants (30% target): {currency} {wants_target:,.2f}\n"
                f"• Savings (20% target): {currency} {savings_target:,.2f}\n"
                f"Your actual total expenses are {currency} {m_expense:,.2f}, leaving a net savings surplus of {currency} {m_savings:,.2f}."
            )
            return AdvisorLLMResponse(
                content=content,
                reasoning=["Compared monthly cashflows against 50/30/20 guideline."],
                facts_used=[f"Monthly income: {currency} {m_income:,.2f}", f"Monthly expenses: {currency} {m_expense:,.2f}"],
                recommendations=["Keep fixed commitments below 50% of take-home pay"],
                action_card=ResponseActionCard(
                    title="Budget Reports",
                    description="Audit cashflows and download monthly financial statements.",
                    actionLabel="View Reports",
                    actionPath="/app/reports",
                ),
                confidence=0.95,
            )

        # -------------------------------------------------------------------
        # 6. General Finance / Overview
        # -------------------------------------------------------------------
        else:
            net_worth = raw_data.get("net_worth", 0)
            m_savings = raw_data.get("monthly_savings", 0)
            content = (
                f"Hello {user_name}! Based on your synced financial records, your lifetime net worth is {currency} {net_worth:,.2f} "
                f"with a monthly cashflow surplus of {currency} {m_savings:,.2f}. Feel free to ask about your spending breakdown, "
                f"budgeting, financial goals, investment portfolio, or risk metrics!"
            )
            return AdvisorLLMResponse(
                content=content,
                reasoning=["Summarized high-level net worth and monthly cashflow."],
                facts_used=[f"Net worth: {currency} {net_worth:,.2f}"],
                recommendations=["Ask specific questions about spending, investments, or goals"],
                action_card=ResponseActionCard(
                    title="Financial Dashboard",
                    description="Explore your full financial overview and metrics.",
                    actionLabel="Go to Dashboard",
                    actionPath="/app/dashboard",
                ),
                confidence=0.90,
            )


class OpenAILLMProvider:
    """Official OpenAI client provider supporting JSON structured outputs and graceful fallback."""

    def __init__(self) -> None:
        self.fallback = DeterministicFallbackLLMProvider()

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        context_str: str,
        intent: str,
        raw_data: Dict[str, Any],
    ) -> AdvisorLLMResponse:
        """Call OpenAI chat completion with structured output schema, falling back on error or missing key."""
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            logger.info("OPENAI_API_KEY not configured. Using DeterministicFallbackLLMProvider.")
            return await self.fallback.generate(system_prompt, user_message, context_str, intent, raw_data)

        try:
            from openai import AsyncOpenAI

            client_kwargs: Dict[str, Any] = {"api_key": api_key}
            if settings.OPENAI_BASE_URL:
                client_kwargs["base_url"] = settings.OPENAI_BASE_URL

            client = AsyncOpenAI(**client_kwargs)

            # JSON instruction appended to system prompt
            json_system_prompt = (
                f"{system_prompt}\n\n"
                "IMPORTANT: Output MUST be a valid JSON object matching this schema:\n"
                "{\n"
                '  "content": "Natural language educational explanation...",\n'
                '  "reasoning": ["point 1", "point 2"],\n'
                '  "facts_used": ["fact 1", "fact 2"],\n'
                '  "recommendations": ["suggestion 1", "suggestion 2"],\n'
                '  "confidence": 0.95,\n'
                '  "warnings": ["consideration 1"]\n'
                "}"
            )

            prompt_messages = [
                {"role": "system", "content": json_system_prompt},
                {
                    "role": "user",
                    "content": f"{context_str}\n\nUser Question: {user_message}",
                },
            ]

            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=prompt_messages,
                    temperature=0.2,
                    response_format={"type": "json_object"},
                ),
                timeout=settings.AI_TIMEOUT_SECONDS,
            )

            choice = response.choices[0].message.content
            if not choice:
                raise ValueError("Empty completion choice returned from OpenAI.")

            parsed = json.loads(choice)
            return AdvisorLLMResponse(
                content=parsed.get("content", "Financial analysis completed."),
                reasoning=parsed.get("reasoning", []),
                facts_used=parsed.get("facts_used", []),
                recommendations=parsed.get("recommendations", []),
                confidence=float(parsed.get("confidence", 0.90)),
                warnings=parsed.get("warnings", []),
            )

        except Exception as exc:
            logger.warning("OpenAI completion failed or timed out (%s). Seamlessly using fallback provider.", str(exc))
            return await self.fallback.generate(system_prompt, user_message, context_str, intent, raw_data)


# Default provider instance based on environment settings
def get_llm_provider() -> LLMProvider:
    if settings.AI_PROVIDER == "deterministic":
        return DeterministicFallbackLLMProvider()
    return OpenAILLMProvider()
