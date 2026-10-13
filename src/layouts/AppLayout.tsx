import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Target,
  FileText,
  Settings,
  TrendingUp,
  PieChart,
  Globe,
  ShieldAlert,
  Lightbulb,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useSettings } from '../features/settings/hooks/useSettings';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  disabled?: boolean;
}

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const { profile } = useSettings();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    {
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
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AI Finance
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.id}>
                {item.disabled ? (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed select-none opacity-75">
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <Badge variant="outline" size="sm" className="text-[10px] py-0">
                      Soon
                    </Badge>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                      item.active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.name || user?.name || 'Alex Morgan'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {profile?.email || user?.email || 'alex@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Open sidebar drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications" onClick={() => navigate('/app/notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />}
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center space-x-2 pl-1 cursor-pointer" onClick={handleLogout}>
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-medium text-slate-700 hidden sm:inline-block">
                {profile?.name || user?.name || 'Alex Morgan'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
            </div>
          </div>
        </header>

        {/* Page Main View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
