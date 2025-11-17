'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    // Enable RLS on all tables
    const tables = [
      'users',
      'refresh_tokens',
      'blacklisted_tokens',
      'reset_tokens',
      'SequelizeMeta',
    ];

    for (const table of tables) {
      try {
        await qi.sequelize.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
        console.log(`✓ RLS enabled on ${table}`);
      } catch (error) {
        // Table might not exist or RLS already enabled
        if (error.message.includes('does not exist')) {
          console.warn(`⚠ Table ${table} does not exist, skipping RLS`);
        } else if (error.message.includes('already enabled')) {
          console.log(`✓ RLS already enabled on ${table}`);
        } else {
          console.error(`✗ Failed to enable RLS on ${table}:`, error.message);
          throw error;
        }
      }
    }

    // Create policies for users table
    // Policy: Users can read their own data
    // Note: This requires Supabase auth extension
    try {
      await qi.sequelize.query(`
        CREATE POLICY "Users can read own data"
        ON "users"
        FOR SELECT
        USING (auth.uid()::uuid = id::uuid);
      `);
      console.log('✓ Created policy: Users can read own data');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn(
          '⚠ Could not create users read policy (might need Supabase auth):',
          error.message
        );
        console.warn('   This is OK if you are not using Supabase auth extension');
      }
    }

    // Policy: Service role can do everything (for NestJS app)
    // Note: This is handled by service_role key in Supabase, which bypasses RLS
    // But we create explicit policies for clarity

    // For refresh_tokens: Only service can access (handled by service_role)
    // For blacklisted_tokens: Only service can access (handled by service_role)
    // For reset_tokens: Only service can access (handled by service_role)
    // For SequelizeMeta: Only service can access (handled by service_role)

    // Note: Since NestJS uses service_role connection, RLS policies are bypassed
    // These policies are for direct database access protection
  },

  async down({ context: qi }) {
    const tables = [
      'users',
      'refresh_tokens',
      'blacklisted_tokens',
      'reset_tokens',
      'SequelizeMeta',
    ];

    // Drop policies first
    try {
      await qi.sequelize.query(`DROP POLICY IF EXISTS "Users can read own data" ON "users";`);
      console.log('✓ Dropped users policy');
    } catch (error) {
      console.warn('⚠ Could not drop users policy:', error.message);
    }

    // Disable RLS
    for (const table of tables) {
      try {
        await qi.sequelize.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
        console.log(`✓ RLS disabled on ${table}`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.warn(`⚠ Table ${table} does not exist, skipping`);
        } else {
          console.error(`✗ Failed to disable RLS on ${table}:`, error.message);
          // Don't throw, continue with other tables
        }
      }
    }
  },
};
