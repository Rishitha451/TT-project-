const fs = require('fs');
const path = require('path');

const files = [
  'Transactions.tsx',
  'Analytics.tsx',
  'Goals.tsx',
  'Reports.tsx',
  'Notifications.tsx',
  'Settings.tsx',
  'ForgotPassword.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace("import React from 'react';\n\n", "");
  fs.writeFileSync(filePath, content);
});
console.log('Fixed imports');
