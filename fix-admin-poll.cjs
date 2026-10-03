const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const target = `  // 2. LIVE POLLING: Orders screen polls every 20 seconds
  useEffect(() => {
    if (!isAuthenticated || !isStaff) return;

    const interval = setInterval(() => {
      // Background poll orders & metrics without showing full screen loader
      loadAllAdminData(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isStaff, isAdmin]);`;

const replacement = `  // 2. LIVE POLLING: Orders screen polls every 60 seconds, only when tab is visible
  useEffect(() => {
    if (!isAuthenticated || !isStaff) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Background poll orders & metrics without showing full screen loader
        loadAllAdminData(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isStaff, isAdmin]);`;

const normalizedCode = code.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
if (normalizedCode.includes(normalizedTarget)) {
  const updated = normalizedCode.replace(normalizedTarget, replacement);
  fs.writeFileSync('src/pages/AdminPage.tsx', updated);
  console.log('Successfully updated AdminPage polling interval.');
} else {
  console.error('Target not found in AdminPage.tsx');
}
