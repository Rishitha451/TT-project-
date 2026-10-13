const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'layouts', 'AppLayout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace disabled and active states
content = content.replace(/path: '#',/g, ''); // Will fix later

const oldNavItems = `  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/app/dashboard',
      active: location.pathname === '/app/dashboard',
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: <Sparkles className="w-5 h-5" />,
      path: '/app/advisor',
      active: location.pathname === '/app/advisor',
      disabled: false,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      
      active: false,
      disabled: true,
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target className="w-5 h-5" />,
      
      active: false,
      disabled: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      
      active: false,
      disabled: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      
      active: false,
      disabled: true,
    },
  ];`;

const newNavItems = `  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/app/dashboard',
      active: location.pathname === '/app/dashboard',
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: <Sparkles className="w-5 h-5" />,
      path: '/app/advisor',
      active: location.pathname === '/app/advisor',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <FileText className="w-5 h-5" />,
      path: '/app/transactions',
      active: location.pathname === '/app/transactions',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/app/analytics',
      active: location.pathname === '/app/analytics',
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target className="w-5 h-5" />,
      path: '/app/goals',
      active: location.pathname === '/app/goals',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      path: '/app/reports',
      active: location.pathname === '/app/reports',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/app/notifications',
      active: location.pathname === '/app/notifications',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/app/settings',
      active: location.pathname === '/app/settings',
    },
  ];`;

content = content.replace(oldNavItems, newNavItems);

// Header logic update
const oldHeader = `{location.pathname === '/app/advisor' ? 'AI Advisor' : 'Dashboard'}`;
const newHeader = `{navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}`;
content = content.replace(oldHeader, newHeader);

// In case replace fails due to mismatch, fallback approach:
if(content.includes('navItems.find(item => item.path === location.pathname)?.label')) {
   fs.writeFileSync(file, content);
} else {
  // Manual string operations
  let regex = /const navItems: NavItem\[\] = \[\s*\{[\s\S]*?\n  \];/;
  content = content.replace(regex, newNavItems);
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync(file, content);
}
console.log('AppLayout updated');
