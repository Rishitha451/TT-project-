"""Deterministic intent classification for financial user queries."""

import re
from typing import List, Tuple


class IntentClassifier:
    """Classifies user queries into discrete financial intents using deterministic rule matching."""

    INTENT_PATTERNS: List[Tuple[str, List[str]]] = [
        (
            "GOALS",
            [
                r"\bgoal\b",
                r"\bgoals\b",
                r"\bmilestone\b",
                r"\btarget\b",
                r"\bon track\b",
            ],
        ),
        (
            "RISK",
            [
                r"\brisks?\b",
                r"\bvolatil(e|ity)\b",
                r"\bbeta\b",
                r"\bsharpe\b",
                r"\bdrawdown\b",
                r"\bexposure\b",
                r"\bconcentration\b",
                r"\bcrash\b",
                r"\bhow safe\b",
            ],
        ),
        (
            "INVESTMENTS",
            [
                r"\binvest\b",
                r"\binvesting\b",
                r"\binvestment\b",
                r"\binvestments\b",
                r"\bportfolio\b",
                r"\bholding\b",
                r"\bholdings\b",
                r"\bstock\b",
                r"\bstocks\b",
                r"\betf\b",
                r"\betfs\b",
                r"\bequit(y|ies)\b",
                r"\bshare\b",
                r"\bshares\b",
                r"\bpnl\b",
                r"\breturn\b",
                r"\breturns\b",
                r"\bdividend\b",
            ],
        ),
        (
            "BUDGETING",
            [
                r"\bbudget\b",
                r"\bbudgeting\b",
                r"\b50/30/20\b",
                r"\bplan\b",
                r"\bplanning\b",
                r"\ballocation\b",
            ],
        ),
        (
            "SPENDING_ANALYSIS",
            [
                r"\bspend\b",
                r"\bspent\b",
                r"\bspending\b",
                r"\bexpense\b",
                r"\bexpenses\b",
                r"\boutflow\b",
                r"\bgrocer(y|ies)\b",
                r"\bshopping\b",
                r"\bfood\b",
                r"\bdining\b",
                r"\brent\b",
                r"\bcost\b",
                r"\bwhere did my money go\b",
            ],
        ),
        (
            "SAVINGS",
            [
                r"\bsav(e|ing|ings)\b",
                r"\bsavings rate\b",
                r"\bemergency fund\b",
                r"\bhow much am i saving\b",
                r"\bsurplus\b",
            ],
        ),
        (
            "TRANSACTIONS",
            [
                r"\btransaction\b",
                r"\btransactions\b",
                r"\brecent purchase\b",
                r"\brecent payments\b",
                r"\bhistory\b",
            ],
        ),
        (
            "FINANCIAL_SUMMARY",
            [
                r"\bnet worth\b",
                r"\btotal wealth\b",
                r"\bhow am i doing\b",
                r"\boverview\b",
                r"\bsummary\b",
                r"\bbalance\b",
                r"\bfinancial health\b",
                r"\bsnapshot\b",
            ],
        ),
    ]

    @classmethod
    def classify(cls, query: str) -> str:
        """Classify a user query into a primary intent category."""
        normalized = query.lower().strip()

        for intent, patterns in cls.INTENT_PATTERNS:
            for pattern in patterns:
                if re.search(pattern, normalized):
                    return intent

        return "GENERAL_FINANCE"
