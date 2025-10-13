import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/index.js';

class Database {
  constructor() {
    this.pool = new Pool(config.database);
    
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('✅ Database connected successfully at:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async close() {
    await this.pool.end();
    console.log('Database pool closed');
  }
}

const db = new Database();

export default db;
