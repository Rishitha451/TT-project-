const fs = require('fs');
const path = require('path');

const fixFile = (p) => {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(p, content);
};

['Transactions.tsx', 'Settings.tsx', 'Goals.tsx', 'Reports.tsx', 'Notifications.tsx'].forEach(f => {
  fixFile(path.join(__dirname, 'src', 'pages', f));
});
