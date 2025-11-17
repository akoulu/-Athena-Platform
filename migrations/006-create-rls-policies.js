'use strict';

/**
 * RLS Policies for Supabase
 *
 * IMPORTANT: This migration creates RLS policies for Supabase.
 * Since NestJS uses service_role connection, RLS is bypassed for the app.
 * These policies protect against direct database access.
 *
 * For production with Supabase:
 * - Use service_role key for NestJS (bypasses RLS)
 * - Use anon/authenticated keys for client-side access (enforced by RLS)
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    const isSupabase =
      process.env.DB_DIALECT === 'postgres' && process.env.DB_HOST?.includes('supabase');

    if (!isSupabase) {
      console.log('⚠ Not using Supabase, skipping RLS policies');
      return;
    }

    try {
      // Policy for refresh_tokens: Service role only (NestJS app)
      // Users should not access this table directly
      await qi.sequelize.query(`
        DROP POLICY IF EXISTS "Service role only" ON "refresh_tokens";
        CREATE POLICY "Service role only"
        ON "refresh_tokens"
        FOR ALL
        USING (false);
      `);
      console.log('✓ Created policy for refresh_tokens');

      // Policy for blacklisted_tokens: Service role only
      await qi.sequelize.query(`
        DROP POLICY IF EXISTS "Service role only" ON "blacklisted_tokens";
        CREATE POLICY "Service role only"
        ON "blacklisted_tokens"
        FOR ALL
        USING (false);
      `);
      console.log('✓ Created policy for blacklisted_tokens');

      // Policy for reset_tokens: Service role only
      await qi.sequelize.query(`
        DROP POLICY IF EXISTS "Service role only" ON "reset_tokens";
        CREATE POLICY "Service role only"
        ON "reset_tokens"
        FOR ALL
        USING (false);
      `);
      console.log('✓ Created policy for reset_tokens');

      // Policy for SequelizeMeta: Service role only
      await qi.sequelize.query(`
        DROP POLICY IF EXISTS "Service role only" ON "SequelizeMeta";
        CREATE POLICY "Service role only"
        ON "SequelizeMeta"
        FOR ALL
        USING (false);
      `);
      console.log('✓ Created policy for SequelizeMeta');

      // Users table: More permissive for authenticated users
      // Users can read their own data
      // Note: This requires Supabase auth extension
      try {
        await qi.sequelize.query(`
          DROP POLICY IF EXISTS "Users can read own data" ON "users";
          CREATE POLICY "Users can read own data"
          ON "users"
          FOR SELECT
          USING (auth.uid()::uuid = id::uuid);
        `);
        console.log('✓ Created policy: Users can read own data');
      } catch (error) {
        if (
          !error.message.includes('already exists') &&
          !error.message.includes('does not exist')
        ) {
          console.warn(
            '⚠ Could not create users read policy (might need Supabase auth):',
            error.message
          );
          console.warn('   This is OK if you are not using Supabase auth extension');
        }
      }

      // Note: Service role (used by NestJS) bypasses RLS automatically
      // These policies only apply to anon/authenticated roles
    } catch (error) {
      console.error('⚠ Error creating RLS policies:', error.message);
      // Don't throw - RLS might not be available in all environments
      if (error.message.includes('row-level security')) {
        console.warn('⚠ RLS might not be enabled. Run migration 005 first.');
      }
    }
  },

  async down({ context: qi }) {
    const tables = [
      'refresh_tokens',
      'blacklisted_tokens',
      'reset_tokens',
      'SequelizeMeta',
      'users',
    ];

    for (const table of tables) {
      try {
        await qi.sequelize.query(`DROP POLICY IF EXISTS "Service role only" ON "${table}";`);
        await qi.sequelize.query(`DROP POLICY IF EXISTS "Users can read own data" ON "${table}";`);
        console.log(`✓ Dropped policies for ${table}`);
      } catch (error) {
        console.warn(`⚠ Could not drop policies for ${table}:`, error.message);
      }
    }
  },
};
