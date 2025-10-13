import minioClient from '../src/config/minio.js';

/**
 * Script to set public read policies on MinIO buckets
 * This allows images to be viewed directly from the browser
 */
async function setPublicPolicies() {
  console.log('🔧 Setting public read policies on MinIO buckets...\n');

  try {
    // Test connection first
    await minioClient.testConnection();

    // Set policy for original photos bucket
    console.log(`📸 Setting policy for: ${minioClient.buckets.original}`);
    const originalPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${minioClient.buckets.original}/*`],
        },
      ],
    };

    await minioClient.getClient().setBucketPolicy(
      minioClient.buckets.original,
      JSON.stringify(originalPolicy)
    );
    console.log(`✅ Public read policy set for: ${minioClient.buckets.original}\n`);

    // Set policy for thumbnails bucket
    console.log(`🖼️  Setting policy for: ${minioClient.buckets.thumbnails}`);
    const thumbnailPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${minioClient.buckets.thumbnails}/*`],
        },
      ],
    };

    await minioClient.getClient().setBucketPolicy(
      minioClient.buckets.thumbnails,
      JSON.stringify(thumbnailPolicy)
    );
    console.log(`✅ Public read policy set for: ${minioClient.buckets.thumbnails}\n`);

    console.log('✅ All bucket policies set successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Original photos bucket: Public read access enabled');
    console.log('   - Thumbnails bucket: Public read access enabled');
    console.log('   - Images should now load in the gallery view');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set bucket policies:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that MinIO is running');
    console.error('2. Verify MinIO credentials in .env file');
    console.error('3. Ensure buckets exist (run: npm run migrate)');
    process.exit(1);
  }
}

// Run the script
setPublicPolicies();
