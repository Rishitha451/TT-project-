const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

const mkdir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// 1. Create Types
mkdir(path.join(srcDir, 'features/investments'));
const typesContent = `export interface PortfolioSummary {
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
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface MarketSentiment {
  score: number;
  label: 'Bearish' | 'Neutral' | 'Bullish';
  volatilityIndex: number;
}

export interface InvestmentInsight {
  id: string;
  asset: string;
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  reasoning: string[];
}
`;
fs.writeFileSync(path.join(srcDir, 'features/investments/types.ts'), typesContent);

// 2. Create Mock Service
mkdir(path.join(srcDir, 'services/mock'));
const mockServiceContent = `import { 
  PortfolioSummary, 
  InvestmentPosition, 
  MarketNewsItem, 
  MarketSentiment, 
  InvestmentInsight 
} from '../../features/investments/types';

const MOCK_PORTFOLIO_SUMMARY: PortfolioSummary = {
  totalValue: 145250.75,
  totalInvested: 120000.00,
  todaysPnl: 1245.50,
  todaysPnlPct: 0.86,
  overallPnl: 25250.75,
  overallPnlPct: 21.04,
  riskLevel: 'Moderate',
  marketSentiment: 'Bullish'
};

const MOCK_POSITIONS: InvestmentPosition[] = [
  { id: '1', ticker: 'AAPL', name: 'Apple Inc.', shares: 50, avgPrice: 150.00, currentPrice: 175.50, totalValue: 8775.00, pnl: 1275.00, pnlPct: 17.00, allocation: 15 },
  { id: '2', ticker: 'MSFT', name: 'Microsoft Corp.', shares: 30, avgPrice: 310.00, currentPrice: 340.20, totalValue: 10206.00, pnl: 906.00, pnlPct: 9.74, allocation: 18 },
  { id: '3', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 100, avgPrice: 380.00, currentPrice: 415.30, totalValue: 41530.00, pnl: 3530.00, pnlPct: 9.29, allocation: 40 }
];

const MOCK_NEWS: MarketNewsItem[] = [
  { id: 'n1', headline: 'Fed signals potential rate cuts later this year', source: 'Financial Times', time: '2 hours ago', sentiment: 'positive' },
  { id: 'n2', headline: 'Tech sector sees mixed results in Q3 earnings', source: 'Reuters', time: '5 hours ago', sentiment: 'neutral' },
  { id: 'n3', headline: 'Inflation data comes in slightly hotter than expected', source: 'Bloomberg', time: '1 day ago', sentiment: 'negative' }
];

const MOCK_SENTIMENT: MarketSentiment = {
  score: 68.5,
  label: 'Bullish',
  volatilityIndex: 14.2
};

const MOCK_INSIGHTS: InvestmentInsight[] = [
  { id: 'i1', asset: 'AAPL', signal: 'HOLD', confidence: 75.4, reasoning: ['Strong Q3 earnings', 'High valuation multiples', 'Macro headwinds'] },
  { id: 'i2', asset: 'NVDA', signal: 'BUY', confidence: 88.2, reasoning: ['AI chip demand surging', 'Positive forward guidance', 'Technical breakout'] }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockInvestmentsService = {
  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    await delay(800);
    return MOCK_PORTFOLIO_SUMMARY;
  },
  getPositions: async (): Promise<InvestmentPosition[]> => {
    await delay(800);
    return MOCK_POSITIONS;
  },
  getMarketNews: async (): Promise<MarketNewsItem[]> => {
    await delay(800);
    return MOCK_NEWS;
  },
  getMarketSentiment: async (): Promise<MarketSentiment> => {
    await delay(800);
    return MOCK_SENTIMENT;
  },
  getRiskMetrics: async (): Promise<{ volatility: number; beta: number; sharpeRatio: number }> => {
    await delay(800);
    return { volatility: 0.14, beta: 1.05, sharpeRatio: 1.2 };
  },
  getInvestmentInsights: async (): Promise<InvestmentInsight[]> => {
    await delay(800);
    return MOCK_INSIGHTS;
  }
};
`;
fs.writeFileSync(path.join(srcDir, 'services/mock/investments.mock.ts'), mockServiceContent);

// 3. Create API Adapter
mkdir(path.join(srcDir, 'features/investments/api'));
const apiAdapterContent = `import { mockInvestmentsService } from '../../../services/mock/investments.mock';
import { 
  PortfolioSummary, 
  InvestmentPosition, 
  MarketNewsItem, 
  MarketSentiment, 
  InvestmentInsight 
} from '../types';

// In the future, this will use apiClient.get('/api/v1/investments/...')

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  return mockInvestmentsService.getPortfolioSummary();
};

export const getPositions = async (): Promise<InvestmentPosition[]> => {
  return mockInvestmentsService.getPositions();
};

export const getMarketNews = async (): Promise<MarketNewsItem[]> => {
  return mockInvestmentsService.getMarketNews();
};

export const getMarketSentiment = async (): Promise<MarketSentiment> => {
  return mockInvestmentsService.getMarketSentiment();
};

export const getRiskMetrics = async (): Promise<{ volatility: number; beta: number; sharpeRatio: number }> => {
  return mockInvestmentsService.getRiskMetrics();
};

export const getInvestmentInsights = async (): Promise<InvestmentInsight[]> => {
  return mockInvestmentsService.getInvestmentInsights();
};
`;
fs.writeFileSync(path.join(srcDir, 'features/investments/api/investments.api.ts'), apiAdapterContent);

// 4. Create Hooks
mkdir(path.join(srcDir, 'features/investments/hooks'));
const hooksContent = `import { useQuery } from '@tanstack/react-query';
import {
  getPortfolioSummary,
  getPositions,
  getMarketNews,
  getMarketSentiment,
  getRiskMetrics,
  getInvestmentInsights
} from '../api/investments.api';

export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ['investments', 'portfolioSummary'],
    queryFn: getPortfolioSummary
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ['investments', 'positions'],
    queryFn: getPositions
  });
};

export const useMarketNews = () => {
  return useQuery({
    queryKey: ['investments', 'marketNews'],
    queryFn: getMarketNews
  });
};

export const useMarketSentiment = () => {
  return useQuery({
    queryKey: ['investments', 'marketSentiment'],
    queryFn: getMarketSentiment
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ['investments', 'riskMetrics'],
    queryFn: getRiskMetrics
  });
};

export const useInvestmentInsights = () => {
  return useQuery({
    queryKey: ['investments', 'insights'],
    queryFn: getInvestmentInsights
  });
};
`;
fs.writeFileSync(path.join(srcDir, 'features/investments/hooks/useInvestments.ts'), hooksContent);

console.log('Foundation files generated.');
