const fs = require('fs');

let code = fs.readFileSync('server/routes/orderRoutes.ts', 'utf8');

code = code.replace('.filter((s) => s.is_active)', '.filter((s) => s.status === "ACTIVE")');
code = code.replace('...s,', '...s, is_active: s.status === "ACTIVE",');
code = code.replace('is_active: true,', 'status: "ACTIVE",');
code = code.replace('if (!slot || !slot.is_active) {', 'if (!slot || slot.status !== "ACTIVE") {');

fs.writeFileSync('server/routes/orderRoutes.ts', code);
console.log('Fixed carefully');
