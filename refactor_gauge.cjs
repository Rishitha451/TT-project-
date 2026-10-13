const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'src/pages/investments/Market.tsx');
let content = fs.readFileSync(p, 'utf8');

// Add import
if (!content.includes('SentimentGauge')) {
  content = content.replace(
    "import { Globe, TrendingUp, TrendingDown, Activity, Brain } from 'lucide-react';",
    "import { Globe, TrendingUp, TrendingDown, Activity, Brain } from 'lucide-react';\nimport { SentimentGauge } from '../../features/investments/components/SentimentGauge';"
  );
}

// Replace <Gauge /> with <SentimentGauge />
content = content.replace(/<Gauge score=\{sentiment\.score\} label=\{sentiment\.label\} \/>/g, 
  "<SentimentGauge score={sentiment.score} label={sentiment.label} />");

// Remove function Gauge
const gaugeStart = content.indexOf('function Gauge(');
if (gaugeStart !== -1) {
  const sparklineStart = content.indexOf('function Sparkline(');
  content = content.substring(0, gaugeStart) + content.substring(sparklineStart);
}

fs.writeFileSync(p, content);
console.log('Refactored Gauge out of Market.tsx');
