import minioClient from '../src/config/minio.js';

async function listBuckets() {
  try {
    const buckets = await minioClient.getClient().listBuckets();
    console.log('\n📦 MinIO Buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name}`);
    });
    console.log('\n📋 Configured buckets:');
    console.log(`   - Original: ${minioClient.buckets.original}`);
    console.log(`   - Thumbnails: ${minioClient.buckets.thumbnails}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listBuckets();
