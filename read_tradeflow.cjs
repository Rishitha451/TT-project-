const fs = require('fs');
const path = require('path');

const tradeflowSrc = path.resolve(__dirname, '../TradeFlow-main/src');

const filesToRead = [
  '../package.json',
  'components/dashboard/IngestionFeed.tsx',
  'components/dashboard/OracleStream.tsx',
  'components/dashboard/DecisionMatrix.tsx',
  'components/dashboard/PortfolioLedger.tsx',
  'components/dashboard/RiskMeter.tsx',
  'components/dashboard/SentimentGauge.tsx',
  'components/dashboard/PaperWallet.tsx',
  'components/dashboard/PulseHeader.tsx',
  'components/dashboard/SentimentSparkline.tsx',
  'pages/Index.tsx'
];

const result = {};

for (const file of filesToRead) {
  try {
    const fullPath = path.join(tradeflowSrc, file);
    result[file] = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    result[file] = `Error: ${e.message}`;
  }
}

fs.writeFileSync('tradeflow_contents.json', JSON.stringify(result, null, 2));
console.log('Finished reading TradeFlow files');
