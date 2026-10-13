import type { 
  PortfolioSummary, 
  InvestmentPosition, 
  MarketNewsItem, 
  MarketSentiment, 
  InvestmentInsight,
  AssetDetail,
  MarketIndex,
  RiskMetrics
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
  {
    id: '1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgPrice: 150.00,
    currentPrice: 175.50,
    totalValue: 8775.00,
    pnl: 1275.00,
    pnlPct: 17.00,
    allocation: 15.0,
    sector: 'Technology',
    assetClass: 'Equity',
    dayChange: 2.15,
    dayChangePct: 1.24,
  },
  {
    id: '2',
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 30,
    avgPrice: 310.00,
    currentPrice: 340.20,
    totalValue: 10206.00,
    pnl: 906.00,
    pnlPct: 9.74,
    allocation: 18.0,
    sector: 'Technology',
    assetClass: 'Equity',
    dayChange: 4.80,
    dayChangePct: 1.43,
  },
  {
    id: '3',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 100,
    avgPrice: 380.00,
    currentPrice: 415.30,
    totalValue: 41530.00,
    pnl: 3530.00,
    pnlPct: 9.29,
    allocation: 40.0,
    sector: 'Broad Market',
    assetClass: 'ETF',
    dayChange: 1.85,
    dayChangePct: 0.45,
  },
  {
    id: '4',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 15,
    avgPrice: 420.00,
    currentPrice: 512.40,
    totalValue: 7686.00,
    pnl: 1386.00,
    pnlPct: 22.00,
    allocation: 12.0,
    sector: 'Semiconductors',
    assetClass: 'Equity',
    dayChange: -3.20,
    dayChangePct: -0.62,
  },
  {
    id: '5',
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    shares: 250,
    avgPrice: 72.50,
    currentPrice: 74.20,
    totalValue: 18550.00,
    pnl: 425.00,
    pnlPct: 2.34,
    allocation: 15.0,
    sector: 'Fixed Income',
    assetClass: 'Fixed Income',
    dayChange: 0.12,
    dayChangePct: 0.16,
  },
];

const MOCK_ASSET_DETAILS: Record<string, AssetDetail> = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Consumer Electronics & Services',
    currentPrice: 175.50,
    dayChange: 2.15,
    dayChangePct: 1.24,
    high52W: 198.23,
    low52W: 147.80,
    marketCap: '$2.72 Trillion',
    peRatio: 28.4,
    dividendYield: 0.58,
    beta: 1.12,
    volume: '54.2M',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.',
    historicalReturns: [
      { period: '1M', returnPct: 3.4 },
      { period: '3M', returnPct: 8.2 },
      { period: '6M', returnPct: 12.5 },
      { period: '1Y', returnPct: 18.7 },
      { period: '3Y', returnPct: 44.2 },
    ],
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    sector: 'Enterprise Software & Cloud',
    currentPrice: 340.20,
    dayChange: 4.80,
    dayChangePct: 1.43,
    high52W: 366.78,
    low52W: 275.30,
    marketCap: '$2.53 Trillion',
    peRatio: 32.1,
    dividendYield: 0.88,
    beta: 0.95,
    volume: '22.8M',
    description: 'Microsoft Corporation develops and supports software, services, devices and solutions including Azure cloud computing, Microsoft 365, and AI platforms.',
    historicalReturns: [
      { period: '1M', returnPct: 2.8 },
      { period: '3M', returnPct: 6.9 },
      { period: '6M', returnPct: 14.1 },
      { period: '1Y', returnPct: 24.3 },
      { period: '3Y', returnPct: 56.8 },
    ],
  },
  VOO: {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    sector: 'Large-Cap Blend ETF',
    currentPrice: 415.30,
    dayChange: 1.85,
    dayChangePct: 0.45,
    high52W: 432.10,
    low52W: 360.50,
    marketCap: '$380 Billion',
    peRatio: 22.8,
    dividendYield: 1.42,
    beta: 1.00,
    volume: '4.1M',
    description: 'Vanguard S&P 500 ETF tracks the benchmark S&P 500 index representing the 500 largest US public corporations across all economic sectors.',
    historicalReturns: [
      { period: '1M', returnPct: 1.9 },
      { period: '3M', returnPct: 4.7 },
      { period: '6M', returnPct: 9.8 },
      { period: '1Y', returnPct: 16.2 },
      { period: '3Y', returnPct: 32.5 },
    ],
  },
  NVDA: {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors & AI Compute',
    currentPrice: 512.40,
    dayChange: -3.20,
    dayChangePct: -0.62,
    high52W: 550.00,
    low52W: 240.00,
    marketCap: '$1.26 Trillion',
    peRatio: 48.6,
    dividendYield: 0.08,
    beta: 1.65,
    volume: '48.5M',
    description: 'NVIDIA designs graphics processing units (GPUs) and accelerated computing platforms powering artificial intelligence, data centers, and automotive systems.',
    historicalReturns: [
      { period: '1M', returnPct: -2.1 },
      { period: '3M', returnPct: 18.4 },
      { period: '6M', returnPct: 38.2 },
      { period: '1Y', returnPct: 92.5 },
      { period: '3Y', returnPct: 185.0 },
    ],
  },
  BND: {
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    sector: 'Broad Fixed Income',
    currentPrice: 74.20,
    dayChange: 0.12,
    dayChangePct: 0.16,
    high52W: 76.50,
    low52W: 69.80,
    marketCap: '$104 Billion',
    peRatio: 0,
    dividendYield: 4.15,
    beta: 0.18,
    volume: '6.8M',
    description: 'Vanguard Total Bond Market ETF tracks the Bloomberg U.S. Aggregate Float Adjusted Index, providing broad exposure to investment-grade U.S. debt securities.',
    historicalReturns: [
      { period: '1M', returnPct: 0.6 },
      { period: '3M', returnPct: 1.4 },
      { period: '6M', returnPct: 2.8 },
      { period: '1Y', returnPct: 5.1 },
      { period: '3Y', returnPct: -1.8 },
    ],
  },
};

const MOCK_INDICES: MarketIndex[] = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', value: 5482.60, change: 18.40, changePct: 0.34 },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', value: 17340.25, change: 92.15, changePct: 0.53 },
  { symbol: 'DOW', name: 'Dow Jones Industrial', value: 41240.80, change: -45.20, changePct: -0.11 },
  { symbol: 'US 10Y', name: '10-Year Treasury Yield', value: 4.18, change: -0.04, changePct: -0.95 },
  { symbol: 'GOLD', name: 'Gold Spot / oz', value: 2658.40, change: 14.80, changePct: 0.56 },
];

const MOCK_NEWS: MarketNewsItem[] = [
  { id: 'n1', headline: 'Fed signals monetary easing trajectory as inflation indicators moderate', source: 'Financial Times', time: '2 hours ago', sentiment: 'positive', ticker: 'SPY', change: 0.85, category: 'Macro' },
  { id: 'n2', headline: 'Enterprise AI infrastructure demand accelerates cloud revenue for top tech', source: 'Reuters', time: '4 hours ago', sentiment: 'positive', ticker: 'MSFT', change: 1.43, category: 'Tech' },
  { id: 'n3', headline: 'Semiconductor supply chain adjusts to next-generation wafer packaging cycles', source: 'Bloomberg', time: '7 hours ago', sentiment: 'neutral', ticker: 'NVDA', change: -0.62, category: 'Equities' },
  { id: 'n4', headline: 'Treasury yields tick lower following robust primary auction demand', source: 'Wall Street Journal', time: '12 hours ago', sentiment: 'positive', ticker: 'BND', change: 0.16, category: 'Macro' },
  { id: 'n5', headline: 'Consumer discretionary spending reflects seasonal back-to-school resilience', source: 'CNBC', time: '1 day ago', sentiment: 'positive', ticker: 'AAPL', change: 1.24, category: 'Equities' },
];

const MOCK_SENTIMENT: MarketSentiment = {
  score: 68.5,
  label: 'Bullish',
  volatilityIndex: 14.2,
  historicalScores: [45, 48, 42, 55, 60, 58, 62, 65, 68, 68.5]
};

const MOCK_SCENARIOS = [
  {
    id: 'sc_1',
    name: 'Fed Rate Hike (+50 bps)',
    description: 'Unexpected inflation pressure leading to short-term bond compression and growth stock multiple contraction.',
    estimatedImpactPct: -3.8,
    severity: 'medium' as const,
    likelihood: 'Low' as const,
  },
  {
    id: 'sc_2',
    name: 'Broad Market Correction (-10%)',
    description: 'Macro slowdown triggering a 10% pullback across large-cap equity indexes.',
    estimatedImpactPct: -7.2,
    severity: 'high' as const,
    likelihood: 'Moderate' as const,
  },
  {
    id: 'sc_3',
    name: 'Tech Sector Earnings Surge (+15%)',
    description: 'Enterprise AI deployments exceeding forecasts and lifting tech leaders.',
    estimatedImpactPct: 6.4,
    severity: 'low' as const,
    likelihood: 'High' as const,
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockInvestmentsService = {
  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    await delay(500);
    return MOCK_PORTFOLIO_SUMMARY;
  },
  getPositions: async (): Promise<InvestmentPosition[]> => {
    await delay(500);
    return MOCK_POSITIONS;
  },
  getAssetDetail: async (ticker: string): Promise<AssetDetail | null> => {
    await delay(400);
    return MOCK_ASSET_DETAILS[ticker.toUpperCase()] || null;
  },
  getMarketIndices: async (): Promise<MarketIndex[]> => {
    await delay(400);
    return MOCK_INDICES;
  },
  getMarketNews: async (): Promise<MarketNewsItem[]> => {
    await delay(500);
    return MOCK_NEWS;
  },
  getMarketSentiment: async (): Promise<MarketSentiment> => {
    await delay(500);
    return MOCK_SENTIMENT;
  },
  getRiskMetrics: async (): Promise<RiskMetrics> => {
    await delay(500);
    return { 
      volatility: 0.142, 
      beta: 1.05, 
      sharpeRatio: 1.20, 
      riskScore: 58, 
      riskLevel: 'Moderate', 
      exposure: [
        { sector: 'Broad Market ETF', percentage: 40 },
        { sector: 'Enterprise Tech', percentage: 18 },
        { sector: 'Consumer Tech', percentage: 15 },
        { sector: 'Fixed Income Bonds', percentage: 15 },
        { sector: 'Semiconductors', percentage: 12 },
      ],
      scenarios: MOCK_SCENARIOS,
    };
  },
  getInvestmentInsights: async (): Promise<InvestmentInsight[]> => {
    await delay(500);
    return [
      {
        id: 'i1',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        analysis: {
          overallSignal: 'Positive',
          confidence: 78,
          factors: [
            { name: 'Technical Trend', signal: 'Positive', contribution: 82 },
            { name: 'Momentum', signal: 'Positive', contribution: 76 },
            { name: 'Valuation', signal: 'Neutral', contribution: 55 },
            { name: 'Risk / Volatility', signal: 'Moderate', contribution: 48 },
          ]
        },
        reasoning: [
          'Momentum remains positive over the observed 3-month period with steady support above 50-day moving average.',
          'Market sentiment is constructive given resilient hardware services revenue and upcoming product upgrade cycles.',
          'Valuation metrics remain balanced, trading slightly above historical 5-year averages.',
          'Portfolio allocation is at a healthy 15%, providing strong participation without excessive single-stock risk.'
        ],
        considerations: [
          '✓ Positive momentum and trend alignment',
          '✓ Constructive macro sentiment',
          '⚠ Moderate sector volatility',
          '⚠ Premium P/E ratio requires monitoring during earnings cycles'
        ],
        timestamp: '2026-09-30T10:15:00Z',
        actionRecommendation: 'HOLD',
      },
      {
        id: 'i2',
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        analysis: {
          overallSignal: 'Positive',
          confidence: 85,
          factors: [
            { name: 'Technical Trend', signal: 'Positive', contribution: 88 },
            { name: 'Momentum', signal: 'Positive', contribution: 90 },
            { name: 'Valuation', signal: 'Neutral', contribution: 45 },
            { name: 'Risk / Volatility', signal: 'Low', contribution: 25 },
          ]
        },
        reasoning: [
          'Azure enterprise software integration continues to lead revenue growth with expanding profit margins.',
          'Copilot and enterprise AI software adoption are driving record enterprise contract renewals.',
          'Balance sheet strength ($110B cash equivalents) offers industry-leading downside resilience.',
          'Position represents 18% of portfolio, serving as a primary capital appreciation driver.'
        ],
        considerations: [
          '✓ Strong fundamental momentum across cloud and productivity',
          '✓ Enterprise AI adoption accelerating',
          '⚠ Multiple expansion leaves lower margin of safety on sudden macro shocks',
          '✓ Low overall drawdown risk due to massive cash reserves'
        ],
        timestamp: '2026-09-30T09:45:00Z',
        actionRecommendation: 'BUY',
      },
      {
        id: 'i3',
        ticker: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        analysis: {
          overallSignal: 'Positive',
          confidence: 92,
          factors: [
            { name: 'Broad Market Breadth', signal: 'Positive', contribution: 94 },
            { name: 'Macro Alignment', signal: 'Positive', contribution: 86 },
            { name: 'Cost Efficiency', signal: 'Positive', contribution: 98 },
            { name: 'Systemic Risk', signal: 'Moderate', contribution: 40 },
          ]
        },
        reasoning: [
          'Serves as the foundational core of your portfolio with 40% allocation, minimizing single-company exposure.',
          'S&P 500 earnings growth remains solid with broadening market breadth outside of mega-cap tech.',
          'Ultra-low expense ratio (0.03%) maximizes long-term compounding efficiency.',
        ],
        considerations: [
          '✓ Core diversified holding across all 11 US economic sectors',
          '✓ High liquidity and compounding dividend reinvestment',
          '⚠ Subject to broader macroeconomic policy shifts and rate cycles'
        ],
        timestamp: '2026-09-30T09:00:00Z',
        actionRecommendation: 'BUY',
      },
      {
        id: 'i4',
        ticker: 'NVDA',
        name: 'NVIDIA Corporation',
        analysis: {
          overallSignal: 'Neutral',
          confidence: 68,
          factors: [
            { name: 'Revenue Growth', signal: 'Positive', contribution: 95 },
            { name: 'Valuation Multiple', signal: 'Negative', contribution: 30 },
            { name: 'Volatility', signal: 'High', contribution: 35 },
            { name: 'Momentum', signal: 'Neutral', contribution: 60 },
          ]
        },
        reasoning: [
          'Dominant market share in AI training and inference accelerators provides strong structural support.',
          'Short-term price action is experiencing consolidation following a massive +92% 1-year run.',
          'Beta of 1.65 indicates heightened price swings relative to the broader market.',
        ],
        considerations: [
          '✓ Unmatched competitive moat in enterprise AI hardware',
          '⚠ Elevated beta (1.65) increases overall portfolio volatility',
          '⚠ Consider trimming if sector allocation exceeds 15%'
        ],
        timestamp: '2026-09-30T08:30:00Z',
        actionRecommendation: 'HOLD',
      },
    ];
  }
};

