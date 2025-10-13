import fetch from 'node-fetch';

async function testUrl() {
  const testUrl = 'http://minio.jameskaranja.me:9000/jhub-photos-original/abb7725d-5cb2-4e4d-a70c-1dd949b1670a/94a6dbac-2cac-44b5-94c9-01693e8e9d16.jpg';
  
  console.log('🔍 Testing URL access...');
  console.log(`   URL: ${testUrl}\n`);

  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`);
    console.log(`      Content-Type: ${response.headers.get('content-type')}`);
    console.log(`      Content-Length: ${response.headers.get('content-length')}`);
    console.log(`      Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    
    if (response.status === 200) {
      console.log('\n   ✅ Image is accessible!');
    } else {
      console.log('\n   ❌ Image is NOT accessible');
    }
    
  } catch (error) {
    console.error('   ❌ Error accessing URL:', error.message);
  }
  
  process.exit(0);
}

testUrl();
