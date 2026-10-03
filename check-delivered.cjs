const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("else if (nextStatus === 'DELIVERED') {"));
console.log(lines.slice(start - 5, start + 20).join('\n'));
