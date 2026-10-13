export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  todaysPnl: number;
  todaysPnlPct: number;
  overallPnl: number;
  overallPnlPct: number;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  marketSentiment: 'Bearish' | 'Neutral' | 'Bullish';
}

export interface InvestmentPosition {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPct: number;
  allocation: number;
  sector?: string;
  assetClass?: 'Equity' | 'ETF' | 'Fixed Income' | 'Commodity';
  dayChange?: number;
  dayChangePct?: number;
}

export interface AssetDetail {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  dayChange: number;
  dayChangePct: number;
  high52W: number;
  low52W: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  beta: number;
  volume: string;
  description: string;
  historicalReturns: { period: string; returnPct: number }[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  ticker?: string;
  change?: number;
  category?: 'Macro' | 'Equities' | 'Tech' | 'Commodities';
}

export interface MarketSentiment {
  score: number;
  label: 'Bearish' | 'Neutral' | 'Bullish';
  volatilityIndex: number;
  historicalScores: number[];
}

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  estimatedImpactPct: number;
  severity: 'low' | 'medium' | 'high';
  likelihood: 'Low' | 'Moderate' | 'High';
}

export interface RiskMetrics {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  exposure: { sector: string; percentage: number }[];
  scenarios?: RiskScenario[];
}

export interface InvestmentInsight {
  id: string;
  ticker: string;
  name: string;
  analysis: {
    overallSignal: 'Positive' | 'Neutral' | 'Negative';
    confidence: number;
    factors: {
      name: string;
      signal: 'Positive' | 'Neutral' | 'Negative' | 'Moderate' | 'High' | 'Low';
      contribution: number;
    }[];
  };
  reasoning: string[];
  considerations: string[];
  timestamp: string;
  actionRecommendation?: 'BUY' | 'HOLD' | 'REBALANCE' | 'TRIM';
}

