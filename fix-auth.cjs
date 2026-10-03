const fs = require('fs');

let code = fs.readFileSync('server/routes/authRoutes.ts', 'utf8');

const target = `const formattedPhoneToSearch = \`+91 \${cleanPhone.slice(0, 5)} \${cleanPhone.slice(5)}\`;
    const existingUser = Array.from(inMemoryStore.profiles.values()).find(p => p.phone === formattedPhoneToSearch || p.phone === cleanPhone);
    const userId = existingUser ? existingUser.id : randomUUID();`;

const replacement = `const formattedPhoneToSearch = \`+91 \${cleanPhone.slice(0, 5)} \${cleanPhone.slice(5)}\`;
    let userId = randomUUID();
    let isRealUser = false;
    if (isLiveSupabase && supabaseServer) {
      const { data } = await supabaseServer.from('profiles').select('id').eq('phone', formattedPhoneToSearch).maybeSingle();
      if (data) {
        userId = data.id;
        isRealUser = true;
      } else {
        const { data: authData, error: authErr } = await supabaseServer.auth.admin.createUser({
          phone: formattedPhoneToSearch,
          phone_confirm: true,
          user_metadata: { full_name: req.body.full_name || 'Valued Patron' }
        });
        if (authData?.user) {
          userId = authData.user.id;
          isRealUser = true;
        } else {
          console.error('Failed to create mock user in Supabase auth:', authErr);
        }
      }
    } else {
      const existingUser = Array.from(inMemoryStore.profiles.values()).find(p => p.phone === formattedPhoneToSearch || p.phone === cleanPhone);
      userId = existingUser ? existingUser.id : randomUUID();
    }`;

code = code.replace(target, replacement);

const target2 = `const token = \`dev-user-\${cleanPhone}\`;`;
const replacement2 = `const token = isRealUser ? \`dev-user-\${userId}\` : \`dev-user-\${cleanPhone}\`;`;
code = code.replace(target2, replacement2);

fs.writeFileSync('server/routes/authRoutes.ts', code);
console.log('Fixed authRoutes demo login');
