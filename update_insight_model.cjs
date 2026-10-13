const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'src');

const typesPath = path.join(srcDir, 'features/investments/types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Replace old InvestmentInsight definition
const oldInsightRegex = /export interface InvestmentInsight \{[\s\S]*?\n\}/;
const newInsightStr = `export interface InvestmentInsight {
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
}`;

if (oldInsightRegex.test(typesContent)) {
  typesContent = typesContent.replace(oldInsightRegex, newInsightStr);
} else {
  typesContent += '\\n' + newInsightStr;
}

fs.writeFileSync(typesPath, typesContent);

const mockPath = path.join(srcDir, 'services/mock/investments.mock.ts');
let mockContent = fs.readFileSync(mockPath, 'utf8');

// Replace old getInvestmentInsights return
const oldMockInsightRegex = /getInvestmentInsights:\s*async\s*\(\):\s*Promise<InvestmentInsight\[\]>\s*=>\s*\{[\s\S]*?return\s*\[[\s\S]*?\];\s*\},/;

const newMockInsightStr = `getInvestmentInsights: async (): Promise<InvestmentInsight[]> => {
    await delay(800);
    return [
      {
        id: 'i1',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        analysis: {
          overallSignal: 'Positive',
          confidence: 72,
          factors: [
            { name: 'Technical', signal: 'Positive', contribution: 82 },
            { name: 'Momentum', signal: 'Positive', contribution: 76 },
            { name: 'Valuation', signal: 'Neutral', contribution: 55 },
            { name: 'Risk', signal: 'Moderate', contribution: 48 }
          ]
        },
        reasoning: [
          'Momentum remains positive over the observed 3-month period.',
          'Market sentiment is currently constructive given upcoming product cycles.',
          'Valuation metrics remain mixed, trading slightly above historical averages.',
          'Portfolio exposure introduces moderate risk if sector concentration is high.'
        ],
        considerations: [
          '✓ Positive momentum and trend alignment',
          '✓ Constructive macro sentiment',
          '⚠ Moderate sector volatility',
          '⚠ Valuation requires monitoring in the near term'
        ],
        timestamp: '2026-09-30T10:15:00Z'
      },
      {
        id: 'i2',
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        analysis: {
          overallSignal: 'Positive',
          confidence: 85,
          factors: [
            { name: 'Technical', signal: 'Positive', contribution: 88 },
            { name: 'Momentum', signal: 'Positive', contribution: 90 },
            { name: 'Valuation', signal: 'Negative', contribution: 30 },
            { name: 'Risk', signal: 'Low', contribution: 20 }
          ]
        },
        reasoning: [
          'Cloud division growth continues to exceed consensus estimates.',
          'AI integration across enterprise software is driving strong user retention.',
          'Valuation is stretched relative to peers, limiting short-term upside.',
          'Overall risk profile is very favorable due to massive cash reserves.'
        ],
        considerations: [
          '✓ Strong fundamental momentum',
          '✓ Enterprise AI adoption accelerating',
          '⚠ Premium valuation multiple',
          '⚠ Currency headwinds in international markets'
        ],
        timestamp: '2026-09-30T09:45:00Z'
      }
    ];
  },`;

if (oldMockInsightRegex.test(mockContent)) {
  mockContent = mockContent.replace(oldMockInsightRegex, newMockInsightStr);
}

fs.writeFileSync(mockPath, mockContent);

console.log('Updated insight model');
