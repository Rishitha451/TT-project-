const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'src');

const mockPath = path.join(srcDir, 'services/mock/investments.mock.ts');
let mockContent = fs.readFileSync(mockPath, 'utf8');

const regexMockInsights = /const MOCK_INSIGHTS:\s*InvestmentInsight\[\]\s*=\s*\[[\s\S]*?\];/;
mockContent = mockContent.replace(regexMockInsights, '');

fs.writeFileSync(mockPath, mockContent);

const insightsPath = path.join(srcDir, 'pages/investments/Insights.tsx');
let insightsContent = fs.readFileSync(insightsPath, 'utf8');

insightsContent = insightsContent.replace(
  "import { Lightbulb, Info, Target, Cpu, ShieldAlert, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';",
  "import { Info, Target, Cpu, BarChart3 } from 'lucide-react';"
);

fs.writeFileSync(insightsPath, insightsContent);
console.log('Fixed TS errors in mock and imports');
