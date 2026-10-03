const fs = require('fs');
const lines = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("router.put('/orders/:id/status'"));
if (start !== -1) {
  console.log(lines.slice(start, start + 30).join('\n'));
} else {
  console.log('Not in adminRoutes.ts');
}
