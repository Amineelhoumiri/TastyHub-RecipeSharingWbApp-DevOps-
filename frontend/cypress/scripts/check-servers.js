// simple script to check if servers are running before tests
const http = require('http');

function checkServer(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ name, status: res.statusCode, running: true });
    });

    req.on('error', () => {
      resolve({ name, status: null, running: false });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ name, status: null, running: false });
    });
  });
}

async function checkServers() {
  console.log('Checking if servers are running...\n');

  const frontend = await checkServer('http://localhost:3000', 'Frontend');
  const backend = await checkServer('http://localhost:5000/api/recipes', 'Backend');

  console.log(`${frontend.name}: ${frontend.running ? '✅ Running' : '❌ Not running'}`);
  console.log(`${backend.name}: ${backend.running ? '✅ Running' : '❌ Not running'}\n`);

  if (!frontend.running || !backend.running) {
    console.log('⚠️  Please start both servers before running tests:');
    if (!frontend.running) {
      console.log('   Frontend: cd frontend && npm run dev');
    }
    if (!backend.running) {
      console.log('   Backend: cd backend && npm run dev');
    }
    process.exit(1);
  }

  console.log('✅ All servers are running! Ready to run tests.\n');
}

checkServers();


