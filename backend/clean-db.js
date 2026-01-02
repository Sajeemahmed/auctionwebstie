// Clean database script
require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected to MySQL');
    
    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME || 'kbn_auction'}\``);
    console.log('✅ Database dropped');
    
    // Create new database
    await connection.execute(`CREATE DATABASE \`${process.env.DB_NAME || 'kbn_auction'}\``);
    console.log('✅ Database created');
    
    await connection.end();
    console.log('✅ Database cleaned successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();
