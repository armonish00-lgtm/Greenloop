require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('YOUR_MYSQL_USER') || dbUrl.includes('YOUR_MYSQL_PASSWORD')) {
    console.log('STATUS: PENDING_CREDENTIALS');
    console.log('Please configure your MySQL username and password in backend/.env');
    process.exit(2);
  }

  try {
    // Parse URL
    const url = new URL(dbUrl.replace('mysql://', 'http://'));
    const host = url.hostname || '127.0.0.1';
    const port = parseInt(url.port || '3306', 10);
    const user = url.username;
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\//, '') || 'greenloop';

    console.log(`Attempting connection to MySQL server at ${host}:${port} as user '${user}'...`);

    // First test server connection without specifying DB to ensure we can create DB if needed
    const serverConn = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    console.log('✓ Successfully authenticated with MySQL server!');

    // Create database if not exists
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✓ Database '${database}' is verified / ready!`);
    await serverConn.end();

    console.log('STATUS: SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('STATUS: FAILED');
    console.error('MySQL Connection Error:', err.message);
    process.exit(1);
  }
}

testConnection();
