import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 10000,
};

async function checkDatabase() {
  const pool = new Pool(config);
  
  try {
    console.log('🔍 Checking database status...\n');
    
    const client = await pool.connect();
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ No tables found!\n');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('');
    }

    // Check row counts
    const expectedTables = ['folders', 'files', 'share_links', 'upload_sessions'];
    console.log('📈 Table row counts:');
    
    for (const table of expectedTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} rows`);
      } catch (error) {
        console.log(`   ${table}: ❌ Table does not exist`);
      }
    }
    console.log('');

    // Check views
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (viewsResult.rows.length > 0) {
      console.log('👁️  Views in database:');
      viewsResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('');
    }

    // Check for root folder
    try {
      const rootResult = await client.query(`
        SELECT id, name, path, created_at FROM folders WHERE path = '/' LIMIT 1;
      `);

      if (rootResult.rows.length > 0) {
        console.log('📁 Root folder status:');
        console.log(`   ✓ Root folder exists`);
        console.log(`   ID: ${rootResult.rows[0].id}`);
        console.log(`   Name: ${rootResult.rows[0].name}`);
        console.log(`   Created: ${rootResult.rows[0].created_at}`);
        console.log('');
      } else {
        console.log('📁 Root folder status:');
        console.log('   ❌ Root folder not found - will be created\n');
      }
    } catch (error) {
      console.log('📁 Root folder status:');
      console.log('   ❌ Cannot check - folders table may not exist\n');
    }

    // Check extensions
    const extResult = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';
    `);

    console.log('🔌 Extensions:');
    if (extResult.rows.length > 0) {
      console.log('   ✓ uuid-ossp extension installed');
    } else {
      console.log('   ❌ uuid-ossp extension not installed');
    }
    console.log('');

    client.release();

    console.log('✅ Database check completed!\n');

  } catch (error) {
    console.error('❌ Error checking database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabase();
