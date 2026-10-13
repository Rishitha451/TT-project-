const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'src');

const typesPath = path.join(srcDir, 'features/investments/types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

if (!typesContent.includes('ticker?: string;')) {
  typesContent = typesContent.replace(
    /export interface MarketNewsItem \{([\s\S]*?)\}/,
    'export interface MarketNewsItem {$1  ticker?: string;\n  change?: number;\n}'
  );
}

if (!typesContent.includes('historicalScores: number[];')) {
  typesContent = typesContent.replace(
    /export interface MarketSentiment \{([\s\S]*?)\}/,
    'export interface MarketSentiment {$1  historicalScores: number[];\n}'
  );
}
fs.writeFileSync(typesPath, typesContent);

const mockPath = path.join(srcDir, 'services/mock/investments.mock.ts');
let mockContent = fs.readFileSync(mockPath, 'utf8');

if (!mockContent.includes('historicalScores:')) {
  mockContent = mockContent.replace(
    "volatilityIndex: 14.2",
    "volatilityIndex: 14.2,\n  historicalScores: [45, 48, 42, 55, 60, 58, 62, 65, 68, 68.5]"
  );
}

if (!mockContent.includes("ticker: 'SPY'")) {
  mockContent = mockContent.replace(
    "{ id: 'n1', headline: 'Fed signals potential rate cuts later this year', source: 'Financial Times', time: '2 hours ago', sentiment: 'positive' }",
    "{ id: 'n1', headline: 'Fed signals potential rate cuts later this year', source: 'Financial Times', time: '2 hours ago', sentiment: 'positive', ticker: 'SPY', change: 1.2 }"
  );
  mockContent = mockContent.replace(
    "{ id: 'n2', headline: 'Tech sector sees mixed results in Q3 earnings', source: 'Reuters', time: '5 hours ago', sentiment: 'neutral' }",
    "{ id: 'n2', headline: 'Tech sector sees mixed results in Q3 earnings', source: 'Reuters', time: '5 hours ago', sentiment: 'neutral', ticker: 'QQQ', change: -0.1 }"
  );
}
fs.writeFileSync(mockPath, mockContent);

console.log('Updated types and mocks');
