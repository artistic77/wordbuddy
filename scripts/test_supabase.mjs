import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('❌ Could not read .env file:', e.message);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[match[1]] = value;
  }
});

const rawUrl = env.VITE_SUPABASE_URL || '';
const rawKey = env.VITE_SUPABASE_ANON_KEY || '';

console.log('========================================');
console.log('       SUPABASE CONNECTION TEST        ');
console.log('========================================');

if (!rawUrl || !rawKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

console.log(`URL:      ${cleanUrl}`);
if (cleanUrl !== rawUrl) {
  console.log(`⚠️ Warning: Raw URL had '/rest/v1' suffix. Correct base URL is ${cleanUrl}`);
}
console.log(`Anon Key: ${rawKey.substring(0, 15)}... (Length: ${rawKey.length})`);
console.log('----------------------------------------');

const supabase = createClient(cleanUrl, rawKey);

async function testConnection() {
  console.log('\n[1/2] Testing Database Tables...');
  const tables = ['profiles', 'vocab_sets', 'vocab_entries', 'study_sessions'];
  let allTablesOk = true;

  for (const table of tables) {
    try {
      const { data, error, status, statusText } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        allTablesOk = false;
        console.log(`  ❌ ${table.padEnd(16)} Error: ${error.message} (Status ${status} ${statusText || ''})`);
      } else {
        console.log(`  ✅ ${table.padEnd(16)} Accessible (Status ${status})`);
      }
    } catch (err) {
      allTablesOk = false;
      console.log(`  ❌ ${table.padEnd(16)} Exception: ${err.message}`);
    }
  }

  console.log('\n[2/2] Testing Auth Service...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`  ⚠️ Auth getSession: ${error.message}`);
    } else {
      console.log('  ✅ Auth Service: Responsive & Operational');
    }
  } catch (err) {
    console.log(`  ❌ Auth Exception: ${err.message}`);
  }

  console.log('========================================');
  if (allTablesOk) {
    console.log('🎉 Supabase connection is 100% SUCCESSFUL!');
  } else {
    console.log('⚠️ Some tables encountered errors. Check permissions or schema.');
  }
  console.log('========================================\n');
}

testConnection();
