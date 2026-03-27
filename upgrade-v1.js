const fs = require('fs');
const path = require('path');

const files = [
  'services/api-gateway/src/routing.js',
  'services/api-gateway/src/index.js',
  'frontend/src/lib/api/endpoints.ts'
];

for (const relPath of files) {
  const fullPath = path.join('c:\\Users\\sqs\\Desktop\\MUS\\evenment project\\evenements-main', relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  // Only replace occurrences of "/api/..." and `/api/...` to safely prefix them.
  content = content.replace(/(['"`])\/api\//g, '$1/api/v1/');
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated', relPath);
}
