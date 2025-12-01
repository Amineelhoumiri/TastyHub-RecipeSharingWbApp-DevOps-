const { Client } = require('pg');

async function createTestDb() {
  const client = new Client({
    user: 'postgres',
    password: 'Amine',
    host: 'localhost',
    port: 5432,
    database: 'postgres' // Connect to default DB to create new one
  });

  try {
    await client.connect();
    console.log('Connected to postgres database');

    // Check if database exists
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = \'TastyHub_test\'');
    if (res.rowCount === 0) {
      console.log('Creating TastyHub_test database...');
      await client.query('CREATE DATABASE "TastyHub_test"');
      console.log('Database created successfully');
    } else {
      console.log('TastyHub_test database already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createTestDb();
