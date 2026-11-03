import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[match[1]] = value;
  }
});

const url = (env.VITE_SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const key = env.VITE_SUPABASE_ANON_KEY || '';

console.log('==============================================');
console.log('      WORD BUDDY SUPABASE VERIFICATION        ');
console.log('==============================================');
console.log('Target URL:', url);

const supabase = createClient(url, key);

async function verify() {
  const tables = [
    { name: 'profiles', label: 'User Profiles' },
    { name: 'vocab_sets', label: 'Vocab Sets' },
    { name: 'vocab_entries', label: 'Vocab Entries' },
    { name: 'study_sessions', label: 'Study Sessions' },
    { name: 'favorite_vocab_sets', label: 'Favorite Sets' }
  ];

  let missingTables = 0;
  console.log('\n--- 1. Table Verification ---');
  for (const { name, label } of tables) {
    const { count, data, error } = await supabase.from(name).select('*', { count: 'exact' }).limit(3);
    if (error) {
      missingTables++;
      console.log(`❌ [${name}] ${label}: NOT FOUND / ERROR -> ${error.message}`);
    } else {
      console.log(`✅ [${name}] ${label}: Active (Total Rows: ${count})`);
    }
  }

  console.log('\n--- 2. Public Starter Vocabulary Sets ---');
  const { data: sets, error: setsErr } = await supabase
    .from('vocab_sets')
    .select('id, title, is_public')
    .eq('is_public', true);

  if (setsErr) {
    console.log('❌ Could not query public sets:', setsErr.message);
  } else if (!sets || sets.length === 0) {
    console.log('⚠️ No public starter vocabulary sets found yet.');
  } else {
    console.log(`✅ Found ${sets.length} Public Starter Sets:`);
    for (const s of sets) {
      const { count } = await supabase
        .from('vocab_entries')
        .select('*', { count: 'exact', head: true })
        .eq('set_id', s.id);
      console.log(`   - "${s.title}" (${count || 0} words) [ID: ${s.id}]`);
    }
  }

  console.log('\n==============================================');
  if (missingTables === 0 && sets && sets.length > 0) {
    console.log('🎉 Database is completely initialized and ready for the app!');
  } else if (missingTables > 0) {
    console.log(`⚠️ Missing ${missingTables} tables. Please execute the SQL script in Supabase SQL Editor.`);
  }
  console.log('==============================================\n');
}

verify();

