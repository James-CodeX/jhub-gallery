import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Database configuration
const config = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.POSTGRES_SSLMODE === 'require' ? {
    rejectUnauthorized: false // For cloud databases like Neon
  } : false,
  connectionTimeoutMillis: 10000,
};

async function runMigration() {
  const pool = new Pool(config);
  
  try {
    console.log('🔄 Connecting to database...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log('');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!\n');

    // Read SQL file
    const sqlPath = join(__dirname, '..', '..', 'database', 'init.sql');
    console.log(`📄 Reading migration file: ${sqlPath}\n`);
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split SQL into individual statements and execute
    console.log('🚀 Running migrations...\n');
    
    try {
      // Execute the entire SQL script
      await client.query(sql);
      console.log('✅ All migrations executed successfully!\n');

      // Verify tables were created
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);

      console.log('📊 Created tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('');

      // Check for views
      const viewsResult = await client.query(`
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      if (viewsResult.rows.length > 0) {
        console.log('👁️  Created views:');
        viewsResult.rows.forEach(row => {
          console.log(`   ✓ ${row.table_name}`);
        });
        console.log('');
      }

      // Check root folder
      const rootResult = await client.query(`
        SELECT id, name, path FROM folders WHERE path = '/';
      `);

      if (rootResult.rows.length > 0) {
        console.log('📁 Root folder created:');
        console.log(`   ID: ${rootResult.rows[0].id}`);
        console.log(`   Name: ${rootResult.rows[0].name}`);
        console.log(`   Path: ${rootResult.rows[0].path}`);
        console.log('');
      }

      console.log('🎉 Database migration completed successfully!\n');
      console.log('Next steps:');
      console.log('  1. Start the backend: npm run dev');
      console.log('  2. Test the API: http://localhost:4000/health');
      console.log('  3. Create your first folder via API');
      console.log('');

    } catch (error) {
      console.error('❌ Error executing migrations:');
      console.error(error.message);
      
      if (error.message.includes('already exists')) {
        console.log('\n⚠️  Some objects already exist. This is normal if you\'ve run migrations before.');
        console.log('   The database is already initialized.\n');
      } else {
        throw error;
      }
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Please check:');
      console.error('   1. Database host and port are correct');
      console.error('   2. Database is running');
      console.error('   3. Firewall allows the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Host not found. Please check:');
      console.error('   1. POSTGRES_HOST in .env is correct');
      console.error('   2. You have internet connection');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   1. POSTGRES_USER is correct');
      console.error('   2. POSTGRES_PASSWORD is correct');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Database does not exist. Please:');
      console.error('   1. Create the database in Neon console');
      console.error('   2. Update POSTGRES_DB in .env');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
