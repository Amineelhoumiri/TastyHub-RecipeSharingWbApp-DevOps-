// Test script to verify database connection
require('dotenv').config();
const sequelize = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 Configuration:');
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'TastyHub'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'postgres'}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || 5500}`);
    console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***set***' : '❌ NOT SET'}`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Database query test successful:', results[0].current_time);
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`\n📋 Found ${tables.length} tables in database:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    await sequelize.close();
    console.log('\n✅ All connection tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check your .env file has correct DB_PASSWORD');
    console.error('   3. Verify DB_HOST and DB_PORT are correct');
    console.error('   4. Ensure database "TastyHub" exists');
    process.exit(1);
  }
}

testConnection();




