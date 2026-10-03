const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Replace logic evaluation
code = code.replace(/order\.payment_status === 'COMPLETED'/g, "order.payment_status === 'CAPTURED'");

// Replace rendering display to look nicer
code = code.replace(/\{order\.payment_method\} • \{order\.payment_status\}/g, "{order.payment_method} • {order.payment_status === 'CAPTURED' ? 'COMPLETED' : order.payment_status}");

fs.writeFileSync('src/pages/AdminPage.tsx', code);
console.log('Fixed AdminPage.tsx');
