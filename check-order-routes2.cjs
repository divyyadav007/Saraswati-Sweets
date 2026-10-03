const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
console.log(lines.slice(566, 600).join('\n'));
