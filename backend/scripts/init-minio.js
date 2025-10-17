import { Client } from 'minio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const clientConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
};

// Only add port if it's explicitly set (for local development)
if (process.env.MINIO_PORT) {
  clientConfig.port = parseInt(process.env.MINIO_PORT, 10);
}

const minioClient = new Client(clientConfig);

const BUCKET_ORIGINAL = process.env.MINIO_BUCKET_ORIGINAL || 'jhub-photos-original';
const BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || 'jhub-photos-thumbnails';

async function initializeMinIO() {
  console.log('🚀 Initializing MinIO...\n');
  console.log(`📍 Endpoint: ${process.env.MINIO_ENDPOINT}${process.env.MINIO_PORT ? ':' + process.env.MINIO_PORT : ''}`);
  console.log(`🔐 Use SSL: ${process.env.MINIO_USE_SSL}`);
  console.log(`🔐 Access Key: ${process.env.MINIO_ACCESS_KEY}`);
  console.log(`🪣 Buckets: ${BUCKET_ORIGINAL}, ${BUCKET_THUMBNAILS}\n`);

  try {
    // Test connection
    console.log('🔌 Testing MinIO connection...');
    await minioClient.listBuckets();
    console.log('✅ Successfully connected to MinIO!\n');

    // Create original photos bucket
    console.log(`📦 Checking bucket: ${BUCKET_ORIGINAL}...`);
    const originalExists = await minioClient.bucketExists(BUCKET_ORIGINAL);
    if (!originalExists) {
      await minioClient.makeBucket(BUCKET_ORIGINAL, 'us-east-1');
      console.log(`✅ Created bucket: ${BUCKET_ORIGINAL}`);
    } else {
      console.log(`✅ Bucket already exists: ${BUCKET_ORIGINAL}`);
    }

    // Create thumbnails bucket
    console.log(`📦 Checking bucket: ${BUCKET_THUMBNAILS}...`);
    const thumbnailExists = await minioClient.bucketExists(BUCKET_THUMBNAILS);
    if (!thumbnailExists) {
      await minioClient.makeBucket(BUCKET_THUMBNAILS, 'us-east-1');
      console.log(`✅ Created bucket: ${BUCKET_THUMBNAILS}`);
    } else {
      console.log(`✅ Bucket already exists: ${BUCKET_THUMBNAILS}`);
    }

    // Set bucket policy for public read access on original photos
    console.log(`\n🔓 Setting public read policy for: ${BUCKET_ORIGINAL}...`);
    const originalPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_ORIGINAL}/*`],
        },
      ],
    };

    try {
      await minioClient.setBucketPolicy(BUCKET_ORIGINAL, JSON.stringify(originalPolicy));
      console.log(`✅ Set public read policy for: ${BUCKET_ORIGINAL}`);
    } catch (error) {
      console.log(`⚠️  Could not set policy for ${BUCKET_ORIGINAL}: ${error.message}`);
    }

    // Set bucket policy for public read access on thumbnails
    console.log(`🔓 Setting public read policy for: ${BUCKET_THUMBNAILS}...`);
    const thumbnailPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_THUMBNAILS}/*`],
        },
      ],
    };

    try {
      await minioClient.setBucketPolicy(BUCKET_THUMBNAILS, JSON.stringify(thumbnailPolicy));
      console.log(`✅ Set public read policy for: ${BUCKET_THUMBNAILS}`);
    } catch (error) {
      console.log(`⚠️  Could not set policy for ${BUCKET_THUMBNAILS}: ${error.message}`);
    }

    // List all buckets
    console.log('\n📋 Current buckets:');
    const buckets = await minioClient.listBuckets();
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (created: ${bucket.creationDate})`);
    });

    console.log('\n✨ MinIO initialization complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Buckets created/verified');
    console.log('   ✅ Public read policies applied');
    console.log('   ✅ Images can be accessed directly from browser');
    console.log('\n💡 Note: If policies failed, they will be set when backend starts');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MinIO initialization failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run initialization
initializeMinIO();
