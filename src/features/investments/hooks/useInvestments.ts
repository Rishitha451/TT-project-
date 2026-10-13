import { useQuery } from '@tanstack/react-query';
import {
  getPortfolioSummary,
  getPositions,
  getAssetDetail,
  getMarketIndices,
  getMarketNews,
  getMarketSentiment,
  getRiskMetrics,
  getInvestmentInsights
} from '../api/investments.api';

export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ['investments', 'portfolioSummary'],
    queryFn: getPortfolioSummary,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ['investments', 'positions'],
    queryFn: getPositions,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAssetDetail = (ticker: string | null) => {
  return useQuery({
    queryKey: ['investments', 'assetDetail', ticker],
    queryFn: () => (ticker ? getAssetDetail(ticker) : Promise.resolve(null)),
    enabled: Boolean(ticker),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMarketIndices = () => {
  return useQuery({
    queryKey: ['investments', 'marketIndices'],
    queryFn: getMarketIndices,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMarketNews = () => {
  return useQuery({
    queryKey: ['investments', 'marketNews'],
    queryFn: getMarketNews,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMarketSentiment = () => {
  return useQuery({
    queryKey: ['investments', 'marketSentiment'],
    queryFn: getMarketSentiment,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ['investments', 'riskMetrics'],
    queryFn: getRiskMetrics,
    staleTime: 2 * 60 * 1000,
  });
};

export const useInvestmentInsights = () => {
  return useQuery({
    queryKey: ['investments', 'insights'],
    queryFn: getInvestmentInsights,
    staleTime: 2 * 60 * 1000,
  });
};

