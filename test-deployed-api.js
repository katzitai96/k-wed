#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test API endpoints after deployment
async function testDeployedAPI(baseUrl) {
  console.log(`🧪 Testing deployed API at: ${baseUrl}\n`);

  const endpoints = [
    { path: '/api/health', method: 'GET', description: 'Health check' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.description}...`);
      const result = await makeRequest(baseUrl + endpoint.path, endpoint.method);
      
      if (result.success) {
        console.log(`✅ ${endpoint.description} - OK`);
        if (endpoint.path === '/api/health') {
          console.log(`   Response: ${result.data.message}`);
        }
      } else {
        console.log(`❌ ${endpoint.description} - Failed`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description} - Error: ${error.message}`);
    }
    console.log('');
  }
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Wedding-RSVP-Test/1.0'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: parsedData, statusCode: res.statusCode });
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${parsedData.error || 'Unknown error'}`, statusCode: res.statusCode });
          }
        } catch (error) {
          resolve({ success: false, error: `Invalid JSON response: ${responseData}`, statusCode: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node test-deployed-api.js <base-url>');
    console.log('Example: node test-deployed-api.js https://your-app.vercel.app');
    process.exit(1);
  }
  
  const baseUrl = args[0];
  testDeployedAPI(baseUrl).catch(console.error);
}

module.exports = { testDeployedAPI };
