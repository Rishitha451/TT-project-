const fs = require('fs');
const path = require('path');

const routerPath = path.join(__dirname, 'src', 'app', 'router.tsx');

let content = fs.readFileSync(routerPath, 'utf8');

const importsToAdd = `
import Transactions from '../pages/Transactions';
import Analytics from '../pages/Analytics';
import Goals from '../pages/Goals';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import ForgotPassword from '../pages/ForgotPassword';
`;

content = content.replace("import { Advisor } from '../pages/Advisor';", "import { Advisor } from '../pages/Advisor';" + importsToAdd);

content = content.replace("element: <Signup />,\n      },", `element: <Signup />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },`);

content = content.replace("element: <Advisor />,\n      },", `element: <Advisor />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },`);

fs.writeFileSync(routerPath, content);
console.log('Router updated');
