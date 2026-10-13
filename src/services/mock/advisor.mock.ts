import type { ApiResponse } from '../../types';
import type { AdvisorMessage } from '../../features/advisor/types';

// Deterministic fixed latency for mock API layer
const MOCK_LATENCY_MS = 600;


export const mockAdvisorService = {
  async sendMessage(userPrompt: string): Promise<ApiResponse<AdvisorMessage>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

    const lowerPrompt = userPrompt.toLowerCase();

    let content = '';
    let actionCard;

    if (lowerPrompt.includes('spend') || lowerPrompt.includes('spending')) {
      content =
        "Based on your financial data for September 2026, your total monthly expenses stand at ₹56,200. Your top expense category is Housing & Rent (₹18,000), followed by Shopping (₹14,200) and Food & Groceries (₹11,500). Shopping expenses are approximately 18% higher than your recent monthly average.";
      actionCard = {
        title: 'Spending Breakdown',
        description: 'Shopping accounts for 25.2% of your overall monthly expenses.',
        actionLabel: 'View Analytics Trends',
        actionPath: '/app/analytics',
      };
    } else if (lowerPrompt.includes('save') || lowerPrompt.includes('saving')) {
      content =
        "You're currently saving ₹28,800 out of your ₹85,000 monthly income. That represents a healthy 33.8% savings rate! You are on track to fund your Emergency Fund milestone (₹1,00,000) within the next 2-3 months.";
      actionCard = {
        title: 'Savings Goals',
        description: 'Emergency Fund is currently at 45% of target.',
        actionLabel: 'Track Financial Goals',
        actionPath: '/app/goals',
      };
    } else if (lowerPrompt.includes('invest') || lowerPrompt.includes('portfolio') || lowerPrompt.includes('stock')) {
      content =
        "Your investment portfolio currently holds a total market value of $145,250.75 across 3 primary holdings (AAPL, MSFT, VOO). Your overall unrealized return is +21.04% (+$25,250.75), with a Moderate risk profile and a bullish market sentiment score of 68.5/100.";
      actionCard = {
        title: 'Portfolio Intelligence',
        description: 'VOO accounts for 40% of portfolio allocation with balanced index exposure.',
        actionLabel: 'Open Investment Hub',
        actionPath: '/app/investments',
      };
    } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('volatility')) {
      content =
        "Your portfolio risk assessment indicates a Moderate risk tier with a portfolio beta of 1.05 and Sharpe ratio of 1.20. Technology exposure is 45%, which contributes most of the near-term volatility. Overall risk score is 58/100.";
      actionCard = {
        title: 'Risk Profile',
        description: 'Portfolio beta of 1.05 is closely aligned with broader market benchmarks.',
        actionLabel: 'Inspect Risk Metrics',
        actionPath: '/app/investments/risk',
      };
    } else if (lowerPrompt.includes('expense') || lowerPrompt.includes('biggest')) {
      content =
        "Your top 3 biggest expenses this month are:\n1. Rent & Housing: ₹18,000 (32.0% of total expenses)\n2. Electronics & Apparel Shopping: ₹14,200 (25.2%)\n3. Supermarket Groceries: ₹11,500 (20.5%)";
      actionCard = {
        title: 'Expense Audit',
        description: 'Housing and Shopping make up over 57% of your total outflows.',
        actionLabel: 'Review Transactions',
        actionPath: '/app/transactions',
      };
    } else if (lowerPrompt.includes('plan') || lowerPrompt.includes('budget')) {
      content =
        "To build an effective 50/30/20 budget for your ₹85,000 income:\n• Needs (50%): ₹42,500 (Actual: ₹29,500)\n• Wants (30%): ₹25,500 (Actual: ₹26,700)\n• Savings/Investments (20%): ₹17,000 (Actual: ₹28,800)\nYour savings allocation is currently beating the 20% rule by 13.8%!";
      actionCard = {
        title: 'Budget Allocation',
        description: 'Current surplus of ₹28,800 provides strong headroom for goal acceleration.',
        actionLabel: 'View Monthly Reports',
        actionPath: '/app/reports',
      };
    } else {
      content =
        `Thank you for asking: "${userPrompt}". Based on your synced accounts, your overall net worth is ₹4,85,000 with a monthly cashflow surplus of ₹28,800. Your investment portfolio holds $145,250 with +21.04% total return. Feel free to ask about your spending, investments, portfolio risk, or savings goals!`;
    }

    const message: AdvisorMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      actionCard,
    };

    return {
      success: true,
      data: message,
      timestamp: new Date().toISOString(),
    };
  },
};

