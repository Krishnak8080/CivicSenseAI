require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const usersToCreate = [
  { email: 'admin@example.com', password: 'password123', role: 'admin' },
  { email: 'user1@example.com', password: 'password123', role: 'user' },
  { email: 'user2@example.com', password: 'password123', role: 'user' },
];

async function seedUsers() {
  for (const user of usersToCreate) {
    try {
      console.log(`Creating user: ${user.email}...`);

      // 1. Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`User ${user.email} already exists in auth.users, skipping auth creation.`);
          continue; // Skip the rest if user already exists
        } else {
          throw authError;
        }
      }

      const userId = authData.user.id;
      console.log(`Created auth user: ${userId}`);

      // 2. Create profile in public.profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email: user.email,
        role: user.role,
      });

      if (profileError) {
        throw profileError;
      }

      console.log(`Successfully created profile for ${user.email} with role: ${user.role}`);
    } catch (err) {
      console.error(`Error processing ${user.email}:`, err.message);
    }
  }

  console.log('Seeding complete!');
}

seedUsers();
