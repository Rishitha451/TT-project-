const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

// 1. Update Router
const routerFile = path.join(srcDir, 'app/router.tsx');
let routerContent = fs.readFileSync(routerFile, 'utf8');

if (!routerContent.includes('InvestmentsOverview')) {
  const imports = `import InvestmentsOverview from '../pages/investments/InvestmentsOverview';
import Portfolio from '../pages/investments/Portfolio';
import Market from '../pages/investments/Market';
import Risk from '../pages/investments/Risk';
import Insights from '../pages/investments/Insights';
`;

  routerContent = routerContent.replace("import { Dashboard } from '../pages/Dashboard';", "import { Dashboard } from '../pages/Dashboard';\n" + imports);

  const routes = `{
        path: 'investments',
        element: <InvestmentsOverview />,
      },
      {
        path: 'investments/portfolio',
        element: <Portfolio />,
      },
      {
        path: 'investments/market',
        element: <Market />,
      },
      {
        path: 'investments/risk',
        element: <Risk />,
      },
      {
        path: 'investments/insights',
        element: <Insights />,
      },`;

  routerContent = routerContent.replace("path: 'dashboard',", routes + "\n      {\n        path: 'dashboard',");
  fs.writeFileSync(routerFile, routerContent);
  console.log('Router updated.');
}

// 2. Update AppLayout
const layoutFile = path.join(srcDir, 'layouts/AppLayout.tsx');
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

if (!layoutContent.includes('investments/portfolio')) {
  // Add Lucide icons
  if (!layoutContent.includes('TrendingUp')) {
    layoutContent = layoutContent.replace('Settings,', 'Settings,\n  TrendingUp,\n  PieChart,\n  Globe,\n  ShieldAlert,\n  Lightbulb,');
  }

  // Find the exact place to insert navItems
  const navItemsStr = `    {
      id: 'dashboard',`;

  const newNavItems = `    {
      id: 'investments',
      label: 'Investments',
      icon: <TrendingUp className="w-5 h-5" />,
      path: '/app/investments',
      active: location.pathname === '/app/investments',
    },
    {
      id: 'inv-portfolio',
      label: 'Portfolio',
      icon: <PieChart className="w-5 h-5 ml-2" />,
      path: '/app/investments/portfolio',
      active: location.pathname === '/app/investments/portfolio',
    },
    {
      id: 'inv-market',
      label: 'Market Intelligence',
      icon: <Globe className="w-5 h-5 ml-2" />,
      path: '/app/investments/market',
      active: location.pathname === '/app/investments/market',
    },
    {
      id: 'inv-risk',
      label: 'Risk & Sentiment',
      icon: <ShieldAlert className="w-5 h-5 ml-2" />,
      path: '/app/investments/risk',
      active: location.pathname === '/app/investments/risk',
    },
    {
      id: 'inv-insights',
      label: 'Investment Insights',
      icon: <Lightbulb className="w-5 h-5 ml-2" />,
      path: '/app/investments/insights',
      active: location.pathname === '/app/investments/insights',
    },
`;

  layoutContent = layoutContent.replace(navItemsStr, newNavItems + navItemsStr);
  fs.writeFileSync(layoutFile, layoutContent);
  console.log('AppLayout updated.');
}
