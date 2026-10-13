const fs = require('fs');
const path = require('path');

const writePage = (name, content) => {
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', name), content);
};

writePage('Transactions.tsx', `
export default function Transactions() {
  const transactions = [
    { id: 1, date: 'Sep 24, 2026', desc: 'Groceries', category: 'Food', amount: -2450, type: 'expense', status: 'completed' },
    { id: 2, date: 'Sep 23, 2026', desc: 'Salary', category: 'Income', amount: 85000, type: 'income', status: 'completed' },
    { id: 3, date: 'Sep 22, 2026', desc: 'Internet Bill', category: 'Utilities', amount: -1500, type: 'expense', status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Export</button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <input type="text" placeholder="Search transactions..." className="px-3 py-2 border rounded-lg w-full max-w-sm" />
          <select className="px-3 py-2 border rounded-lg bg-white">
            <option>All Categories</option>
            <option>Food</option>
            <option>Income</option>
            <option>Utilities</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.desc}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600">{t.category}</span>
                  </td>
                  <td className={\`px-6 py-4 text-right font-medium \${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}\`}>
                    {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`);

writePage('Analytics.tsx', `
export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <select className="px-3 py-2 border rounded-lg bg-white">
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex items-center justify-center">
          <p className="text-slate-400">Spending Trends Chart (Mock)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex items-center justify-center">
          <p className="text-slate-400">Category Breakdown (Mock)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Spending Categories</h2>
        <div className="space-y-4">
          {['Food & Dining', 'Housing', 'Transportation'].map((cat, i) => (
            <div key={cat} className="flex justify-between items-center">
              <span className="text-slate-600">{cat}</span>
              <div className="w-2/3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: \`\${80 - (i * 20)}%\` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

writePage('Goals.tsx', `
export default function Goals() {
  const goals = [
    { id: 1, name: 'Emergency Fund', target: 100000, current: 45000, color: 'bg-emerald-500' },
    { id: 2, name: 'Vacation', target: 75000, current: 15000, color: 'bg-blue-500' },
    { id: 3, name: 'New Laptop', target: 120000, current: 90000, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Financial Goals</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Goal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">{goal.name}</h3>
              <div className="flex justify-between text-sm text-slate-500 mb-4">
                <span>₹{goal.current.toLocaleString()} saved</span>
                <span>₹{goal.target.toLocaleString()} target</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={\`h-full \${goal.color} rounded-full\`} style={{ width: \`\${progress}%\` }} />
              </div>
              <div className="text-right text-xs font-medium text-slate-700">{progress}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

writePage('Reports.tsx', `
export default function Reports() {
  const reports = [
    { id: 1, name: 'Monthly Financial Summary', date: 'September 2026', status: 'Ready' },
    { id: 2, name: 'Spending Report', date: 'Q3 2026', status: 'Ready' },
    { id: 3, name: 'Tax Year Overview', date: '2025-2026', status: 'Processing' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900">{report.name}</h3>
              <p className="text-sm text-slate-500">{report.date}</p>
            </div>
            <button className={\`px-4 py-2 rounded-lg text-sm font-medium \${
              report.status === 'Ready' 
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }\`}>
              {report.status === 'Ready' ? 'View Report' : 'Processing...'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

writePage('Notifications.tsx', `
import { Bell } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    { id: 1, title: 'Your monthly spending report is ready', time: '2 hours ago', read: false },
    { id: 2, title: 'Your savings goal is 42% complete', time: 'Yesterday', read: true },
    { id: 3, title: 'New AI insight available on your dashboard', time: 'Sep 24', read: true }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Mark all as read</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        {notifications.map(n => (
          <div key={n.id} className={\`p-4 flex gap-4 \${!n.read ? 'bg-indigo-50/50' : ''}\`}>
            <div className={\`mt-1 p-2 rounded-full \${!n.read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}\`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className={\`text-sm \${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}\`}>{n.title}</p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

writePage('Settings.tsx', `
export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button className="px-6 py-3 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">Profile</button>
          <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">Preferences</button>
          <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">Security</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Alex Morgan" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" defaultValue="alex@example.com" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

writePage('ForgotPassword.tsx', `
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="alex@example.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Send Reset Link
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
`);

console.log('Finished writing complex UI components.');
