const fs = require('fs');
const path = require('path');

const features = ['transactions', 'analytics', 'goals', 'reports', 'notifications', 'settings'];

features.forEach(feature => {
  const capFeature = feature.charAt(0).toUpperCase() + feature.slice(1);
  
  // Create folders
  const featurePath = path.join(__dirname, 'src', 'features', feature);
  const componentsPath = path.join(featurePath, 'components');
  const apiPath = path.join(featurePath, 'api');
  const hooksPath = path.join(featurePath, 'hooks');
  
  fs.mkdirSync(componentsPath, { recursive: true });
  fs.mkdirSync(apiPath, { recursive: true });
  fs.mkdirSync(hooksPath, { recursive: true });
  
  // Create mock service
  const mockContent = `export const mock${capFeature} = {
  get: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [];
  }
};`;
  fs.writeFileSync(path.join(__dirname, 'src', 'services', 'mock', `${feature}.mock.ts`), mockContent);
  
  // Create Page
  const pageContent = `import React from 'react';

const ${capFeature} = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${capFeature}</h1>
      <p className="text-gray-500">This feature is currently under construction (Mocked UI).</p>
    </div>
  );
};

export default ${capFeature};
`;
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', `${capFeature}.tsx`), pageContent);
});

// Forgot Password Page
const fpContent = `import React from 'react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-2 border rounded-md" />
          <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">Send Reset Link</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
`;
fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'ForgotPassword.tsx'), fpContent);

console.log('Scaffold complete.');
