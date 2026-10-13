const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'layouts', 'AppLayout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add imports
if (!content.includes('useSettingsStore')) {
  content = content.replace(
    "import { useUIStore } from '../stores/ui.store';",
    "import { useUIStore } from '../stores/ui.store';\nimport { useSettingsStore } from '../stores/settings.store';\nimport { useNotificationsStore } from '../stores/notifications.store';"
  );
}

// Add hook calls
if (!content.includes('const { profile } = useSettingsStore()')) {
  content = content.replace(
    "const { isSidebarOpen, setSidebarOpen } = useUIStore();",
    "const { isSidebarOpen, setSidebarOpen } = useUIStore();\n  const { profile } = useSettingsStore();\n  const { notifications } = useNotificationsStore();\n  const unreadCount = notifications.filter(n => !n.read).length;"
  );
}

// Replace Alex Morgan with profile.name
content = content.replace(/\{user\?.name \|\| 'Alex Morgan'\}/g, "{profile?.name || user?.name || 'Alex Morgan'}");
content = content.replace(/\{user\?.email \|\| 'alex@example.com'\}/g, "{profile?.email || user?.email || 'alex@example.com'}");

// Replace user name initial logic
content = content.replace(/\{user\?.name \? user.name.charAt\(0\).toUpperCase\(\) : 'A'\}/g, "{profile?.name ? profile.name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : 'A'}");

// Notification badge logic
content = content.replace(
  '<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />',
  `{unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />}`
);

// Navigation fixes (make sure link paths to navigate)
content = content.replace(
  'aria-label="Notifications"',
  'aria-label="Notifications" onClick={() => navigate(\'/app/notifications\')}'
);

fs.writeFileSync(file, content);
console.log('AppLayout updated with settings and notifications store.');
