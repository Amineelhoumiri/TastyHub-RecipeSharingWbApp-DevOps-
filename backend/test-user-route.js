// Quick test script to verify the getUserById route is working
const http = require('http');

// Test with a sample UUID (replace with a real user ID from your database)
const testUserId = process.argv[2] || 'test-id';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/users/${testUserId}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log(`Testing GET /api/users/${testUserId}...`);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('✅ Valid JSON response:', JSON.stringify(json, null, 2));
    } catch (_error) {
      console.log('❌ Not valid JSON:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  console.log('Make sure the backend server is running on port 5000');
});

req.end();


