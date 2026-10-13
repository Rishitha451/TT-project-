import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { 
  PortfolioSummary, 
  InvestmentPosition, 
  MarketNewsItem, 
  MarketSentiment, 
  InvestmentInsight,
  AssetDetail,
  MarketIndex,
  RiskMetrics
} from '../types';

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const response = await apiClient.get<PortfolioSummary>(API_ENDPOINTS.INVESTMENTS.SUMMARY);
  if (!response.success || !response.data) {
    throw response.error || { code: 'PORTFOLIO_SUMMARY_FETCH_FAILED', message: 'Unable to load portfolio summary' };
  }
  return response.data;
};

export const getPositions = async (): Promise<InvestmentPosition[]> => {
  const response = await apiClient.get<InvestmentPosition[]>(API_ENDPOINTS.INVESTMENTS.POSITIONS);
  if (!response.success || !response.data) {
    throw response.error || { code: 'POSITIONS_FETCH_FAILED', message: 'Unable to load investment positions' };
  }
  return response.data;
};

export const getAssetDetail = async (ticker: string): Promise<AssetDetail | null> => {
  try {
    const response = await apiClient.get<AssetDetail>(`/api/v1/investments/assets/${ticker}`);
    return response.data || null;
  } catch {
    // Graceful fallback for single asset detail
    return null;
  }
};

export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  const response = await apiClient.get<MarketIndex[]>(API_ENDPOINTS.INVESTMENTS.INDICES);
  if (!response.success || !response.data) {
    throw response.error || { code: 'MARKET_INDICES_FETCH_FAILED', message: 'Unable to load market indices' };
  }
  return response.data;
};

export const getMarketNews = async (): Promise<MarketNewsItem[]> => {
  const response = await apiClient.get<MarketNewsItem[]>(API_ENDPOINTS.INVESTMENTS.NEWS);
  if (!response.success || !response.data) {
    throw response.error || { code: 'MARKET_NEWS_FETCH_FAILED', message: 'Unable to load market news' };
  }
  return response.data;
};

export const getMarketSentiment = async (): Promise<MarketSentiment> => {
  const response = await apiClient.get<MarketSentiment>(API_ENDPOINTS.INVESTMENTS.SENTIMENT);
  if (!response.success || !response.data) {
    throw response.error || { code: 'MARKET_SENTIMENT_FETCH_FAILED', message: 'Unable to load market sentiment' };
  }
  return response.data;
};

export const getRiskMetrics = async (): Promise<RiskMetrics> => {
  const response = await apiClient.get<RiskMetrics>(API_ENDPOINTS.INVESTMENTS.RISK);
  if (!response.success || !response.data) {
    throw response.error || { code: 'RISK_METRICS_FETCH_FAILED', message: 'Unable to load risk metrics' };
  }
  return response.data;
};

export const getInvestmentInsights = async (): Promise<InvestmentInsight[]> => {
  const response = await apiClient.get<InvestmentInsight[]>(API_ENDPOINTS.INVESTMENTS.INSIGHTS);
  if (!response.success || !response.data) {
    throw response.error || { code: 'INVESTMENT_INSIGHTS_FETCH_FAILED', message: 'Unable to load investment insights' };
  }
  return response.data;
};
