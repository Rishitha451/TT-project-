const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

const replaceInFile = (file, search, replacement) => {
  const p = path.join(srcDir, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.split(search).join(replacement);
    fs.writeFileSync(p, content);
  }
};

// Fix imports in InvestmentsOverview.tsx
replaceInFile('pages/investments/InvestmentsOverview.tsx', 
  "from '../features", "from '../../features");
replaceInFile('pages/investments/InvestmentsOverview.tsx', 
  "from '../components", "from '../../components");

// Fix type imports in api and mock
replaceInFile('features/investments/api/investments.api.ts', 
  "import { \n  PortfolioSummary", "import type { \n  PortfolioSummary");
replaceInFile('services/mock/investments.mock.ts', 
  "import { \n  PortfolioSummary", "import type { \n  PortfolioSummary");

// Fix ErrorState import across all files
const pages = ['InvestmentsOverview.tsx', 'Portfolio.tsx', 'Market.tsx', 'Risk.tsx', 'Insights.tsx'];
pages.forEach(p => {
  replaceInFile('pages/investments/' + p, 
    "import ErrorState from", "import { ErrorState } from");
});

// Fix Badge variants in Insights
replaceInFile('pages/investments/Insights.tsx',
  "variant={insight.signal === 'BUY' ? 'success' : insight.signal === 'SELL' ? 'destructive' : 'secondary'}",
  "variant={insight.signal === 'BUY' ? 'success' : insight.signal === 'SELL' ? 'error' : 'default'}");

console.log('Fixed TS errors.');
