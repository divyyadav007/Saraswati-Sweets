const fs = require('fs');

let code = fs.readFileSync('server/authMiddleware.ts', 'utf8');

const target = `      let cleanPhone = '';

      if (token.startsWith('dev-user-')) {
        cleanPhone = token.replace('dev-user-', '').replace(/\\D/g, '').slice(-10);
      }

      let existing = null;
      if (token === 'demo-admin-token') {
        existing = inMemoryStore.profiles.get('admin-default');
      } else if (token === 'demo-staff-token') {
        existing = inMemoryStore.profiles.get('staff-default');
      } else if (cleanPhone) {
        const formattedPhone = \`+91 \${cleanPhone.slice(0, 5)} \${cleanPhone.slice(5)}\`;
        existing = Array.from(inMemoryStore.profiles.values()).find(p => p.phone === formattedPhone || p.phone === cleanPhone);
      } else {
        existing = inMemoryStore.profiles.get(token);
      }`;

const replacement = `      let cleanPhone = '';
      let mockId = '';

      if (token.startsWith('dev-user-')) {
        const suffix = token.replace('dev-user-', '');
        if (suffix.includes('-')) {
          mockId = suffix;
        } else {
          cleanPhone = suffix.replace(/\\D/g, '').slice(-10);
        }
      }

      let existing = null;
      if (token === 'demo-admin-token') {
        existing = inMemoryStore.profiles.get('admin-default');
      } else if (token === 'demo-staff-token') {
        existing = inMemoryStore.profiles.get('staff-default');
      } else if (mockId) {
        existing = inMemoryStore.profiles.get(mockId);
      } else if (cleanPhone) {
        const formattedPhone = \`+91 \${cleanPhone.slice(0, 5)} \${cleanPhone.slice(5)}\`;
        existing = Array.from(inMemoryStore.profiles.values()).find(p => p.phone === formattedPhone || p.phone === cleanPhone);
      } else {
        existing = inMemoryStore.profiles.get(token);
      }`;

code = code.replace(target, replacement);

const target2 = `        existing = {
          id: randomUUID(),`;

const replacement2 = `        existing = {
          id: mockId || randomUUID(),`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server/authMiddleware.ts', code);
console.log('Fixed authMiddleware demo login');
