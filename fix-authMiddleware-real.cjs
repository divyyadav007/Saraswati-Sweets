const fs = require('fs');

let code = fs.readFileSync('server/authMiddleware.ts', 'utf8');

const searchStr1 = 'let cleanPhone = \'\';';
const endStr1 = 'existing = inMemoryStore.profiles.get(token);\n      }';
const endStr1_crlf = 'existing = inMemoryStore.profiles.get(token);\r\n      }';

const start1 = code.indexOf(searchStr1);
let end1 = code.indexOf(endStr1);
let endLen = endStr1.length;
if (end1 === -1) {
  end1 = code.indexOf(endStr1_crlf);
  endLen = endStr1_crlf.length;
}

if (start1 !== -1 && end1 !== -1 && start1 < end1) {
  const replacement1 = `let cleanPhone = '';
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
  
  code = code.substring(0, start1) + replacement1 + code.substring(end1 + endLen);
  console.log('Part 1 replaced');
} else {
  console.log('Part 1 bounds not found', start1, end1);
}

const searchStr2 = 'existing = {\n          id: randomUUID(),';
const searchStr2_crlf = 'existing = {\r\n          id: randomUUID(),';

let start2 = code.indexOf(searchStr2);
let searchLen2 = searchStr2.length;
if (start2 === -1) {
  start2 = code.indexOf(searchStr2_crlf);
  searchLen2 = searchStr2_crlf.length;
}

if (start2 !== -1) {
  const replacement2 = `existing = {\n          id: (mockId || randomUUID()) as any,`;
  code = code.substring(0, start2) + replacement2 + code.substring(start2 + searchLen2);
  console.log('Part 2 replaced');
} else {
  console.log('Part 2 bounds not found', start2);
}

fs.writeFileSync('server/authMiddleware.ts', code);
console.log('Successfully replaced authMiddleware.ts');
