const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace(/payment_status: 'PENDING' \| 'COMPLETED' \| 'FAILED' \| 'REFUNDED';/g, "payment_status: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';");

fs.writeFileSync('server/db.ts', code);
console.log('Fixed db.ts');
