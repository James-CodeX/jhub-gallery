import minioClient from '../src/config/minio.js';

async function checkPolicy() {
  try {
    console.log('🔍 Checking bucket policies...\n');

    // Check original bucket policy
    console.log(`📦 Bucket: ${minioClient.buckets.original}`);
    try {
      const policy = await minioClient.getClient().getBucketPolicy(minioClient.buckets.original);
      const parsedPolicy = JSON.parse(policy);
      console.log('   ✅ Policy exists:');
      console.log(JSON.stringify(parsedPolicy, null, 2));
    } catch (error) {
      console.log('   ❌ No policy or error:', error.message);
    }

    console.log(`\n📦 Bucket: ${minioClient.buckets.thumbnails}`);
    try {
      const policy = await minioClient.getClient().getBucketPolicy(minioClient.buckets.thumbnails);
      const parsedPolicy = JSON.parse(policy);
      console.log('   ✅ Policy exists:');
      console.log(JSON.stringify(parsedPolicy, null, 2));
    } catch (error) {
      console.log('   ❌ No policy or error:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPolicy();
