// Test script to verify frontend → backend connection
// Run this with: node frontend/test-api-connection.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function testBackendConnection() {
  console.log('🔍 Testing Frontend → Backend connection...');
  console.log(`📡 Backend URL: ${API_BASE_URL}\n`);

  // Test 1: Check if backend is running
  try {
    console.log('1️⃣ Testing backend server availability...');
    const healthCheck = await fetch(`${API_BASE_URL}/api/recipes`);
    
    if (healthCheck.ok || healthCheck.status === 401 || healthCheck.status === 404) {
      console.log('✅ Backend server is running and responding');
    } else {
      console.log(`⚠️  Backend responded with status: ${healthCheck.status}`);
    }
  } catch (error) {
    console.error('❌ Cannot reach backend server:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Make sure backend is running: cd backend && npm run dev');
    console.error('   2. Check if backend is running on port 5000');
    console.error('   3. Verify CORS is configured correctly');
    return;
  }

  // Test 2: Test recipes endpoint
  try {
    console.log('\n2️⃣ Testing GET /api/recipes endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/recipes`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Recipes endpoint working - Found ${Array.isArray(data) ? data.length : 'data'} items`);
    } else {
      console.log(`⚠️  Recipes endpoint returned status: ${response.status}`);
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('❌ Error testing recipes endpoint:', error.message);
  }

  // Test 3: Test register endpoint (should fail without data, but endpoint should exist)
  try {
    console.log('\n3️⃣ Testing POST /api/users/register endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Empty body to test endpoint exists
    });
    const data = await response.json();
    
    if (response.status === 400 || response.status === 422) {
      console.log('✅ Register endpoint exists and validates input');
    } else {
      console.log(`⚠️  Register endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing register endpoint:', error.message);
  }

  console.log('\n✅ Frontend → Backend connection test complete!');
}

// Only run if executed directly (not imported)
if (typeof require !== 'undefined' && require.main === module) {
  testBackendConnection();
}




