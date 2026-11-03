import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

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

const supabase = createClient(url, key);

async function testLineAuthFlow() {
  console.log('==============================================');
  console.log('        TESTING LINE AUTH FLOW END-TO-END     ');
  console.log('==============================================');

  const testLineUid = 'U_test_wb_' + Math.random().toString(36).substring(2, 10);
  const mockLineProfile = {
    userId: testLineUid,
    displayName: 'น้องสมหวัง รักเรียน',
    pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Somwang',
  };

  console.log('1. Mock LINE Profile:', mockLineProfile);

  const cleanUid = mockLineProfile.userId.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  const email = `line_${cleanUid}@line.me`;
  const deterministicPassword = `LINE_WB_${mockLineProfile.userId}_AUTH!`;

  console.log('2. Target Auth Email:', email);

  // 1. Initial attempt: signInWithPassword (should fail initially since it is a new user)
  console.log('3. Attempting initial signInWithPassword...');
  let { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: deterministicPassword,
  });

  let activeSession = signInData?.session || null;
  let authUserId = signInData?.user?.id || null;

  if (signInErr) {
    console.log('   Expected initial sign-in error:', signInErr.message);
  }

  // 2. SignUp new LINE user
  if (!authUserId) {
    console.log('4. Calling supabase.auth.signUp...');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: deterministicPassword,
      options: {
        data: {
          display_name: mockLineProfile.displayName,
          avatar_url: mockLineProfile.pictureUrl,
        },
      },
    });

    if (signUpErr) {
      console.error('❌ SignUp failed:', signUpErr.message);
      process.exit(1);
    }

    console.log('   SignUp succeeded! User ID:', signUpData.user?.id);
    authUserId = signUpData.user?.id;
    activeSession = signUpData.session;

    if (!activeSession) {
      console.log('   Session not attached on signup, acquiring session explicitly...');
      const explicit = await supabase.auth.signInWithPassword({
        email,
        password: deterministicPassword,
      });
      activeSession = explicit.data?.session || null;
    }
  }

  console.log('5. Session Active?:', Boolean(activeSession), '(User:', activeSession?.user?.email, ')');

  // 3. Update profile with LINE metadata
  console.log('6. Updating public.profiles with LINE data...');
  const { data: updatedProfile, error: updateErr } = await supabase
    .from('profiles')
    .update({
      line_user_id: mockLineProfile.userId,
      line_display_name: mockLineProfile.displayName,
      line_picture_url: mockLineProfile.pictureUrl,
      display_name: mockLineProfile.displayName,
      avatar_url: mockLineProfile.pictureUrl,
    })
    .eq('id', authUserId)
    .select()
    .single();

  if (updateErr) {
    console.error('❌ Profile update failed:', updateErr.message);
    process.exit(1);
  }

  console.log('   Profile successfully updated in database:');
  console.log('   - Display Name:', updatedProfile.display_name);
  console.log('   - LINE UID:    ', updatedProfile.line_user_id);
  console.log('   - Avatar URL:  ', updatedProfile.avatar_url);

  // 4. Test Second Login (Returning User)
  console.log('\n7. Testing Returning User Login (Second visit)...');
  const secondLogin = await supabase.auth.signInWithPassword({
    email,
    password: deterministicPassword,
  });

  if (secondLogin.error) {
    console.error('❌ Returning login failed:', secondLogin.error.message);
    process.exit(1);
  }

  console.log('✅ Returning user successfully logged in! User ID:', secondLogin.data.user.id);
  console.log('==============================================');
  console.log('🎉 LINE AUTH FLOW IS 100% OPERATIONAL!');
  console.log('==============================================\n');
}

testLineAuthFlow();

