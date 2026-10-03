const supabase = require('@supabase/supabase-js');
const client = supabase.createClient('https://pdovuxqbymgqzvaxcwuk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkb3Z1eHFieW1ncXp2YXhjd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQzNzcyNywiZXhwIjoyMTA2MDEzNzI3fQ.hj1d23Ci41oYdoqoqvuCuTCUDkTSYcR_L7goL_FNXrY');

async function checkSchema() {
  const { data, error } = await client.rpc('get_table_schema', { table_name_param: 'order_items' });
  console.log('rpc get_table_schema:', data, error);
}
checkSchema();
