const fs = require('fs');
const lines = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("router.put('/:id/status'"));
if (start !== -1) {
  console.log(lines.slice(start, start + 30).join('\n'));
} else {
  console.log('Not in orderRoutes.ts');
}
