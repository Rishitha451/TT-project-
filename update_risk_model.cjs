const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'src');

const mockPath = path.join(srcDir, 'services/mock/investments.mock.ts');
let mockContent = fs.readFileSync(mockPath, 'utf8');

// Update getRiskMetrics in mock
mockContent = mockContent.replace(
  "export const mockInvestmentsService = {",
  "export interface RiskMetrics {\n  volatility: number;\n  beta: number;\n  sharpeRatio: number;\n  riskScore: number;\n  riskLevel: 'Low' | 'Moderate' | 'High';\n  exposure: { sector: string, percentage: number }[];\n}\n\nexport const mockInvestmentsService = {"
);

mockContent = mockContent.replace(
  "getRiskMetrics: async (): Promise<{ volatility: number; beta: number; sharpeRatio: number }> => {\n    await delay(800);\n    return { volatility: 0.14, beta: 1.05, sharpeRatio: 1.2 };\n  },",
  "getRiskMetrics: async (): Promise<RiskMetrics> => {\n    await delay(800);\n    return { \n      volatility: 0.14, \n      beta: 1.05, \n      sharpeRatio: 1.2, \n      riskScore: 58, \n      riskLevel: 'Moderate', \n      exposure: [\n        { sector: 'Technology', percentage: 45 },\n        { sector: 'Financials', percentage: 25 },\n        { sector: 'Healthcare', percentage: 20 },\n        { sector: 'Consumer Discretionary', percentage: 10 }\n      ]\n    };\n  },"
);
fs.writeFileSync(mockPath, mockContent);

const apiPath = path.join(srcDir, 'features/investments/api/investments.api.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');
apiContent = apiContent.replace(
  "export const getRiskMetrics = async (): Promise<{ volatility: number; beta: number; sharpeRatio: number }> => {",
  "import type { RiskMetrics } from '../../../services/mock/investments.mock';\n\nexport const getRiskMetrics = async (): Promise<RiskMetrics> => {"
);
fs.writeFileSync(apiPath, apiContent);

console.log('Updated risk metrics model');
