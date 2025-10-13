import db from '../src/config/database.js';
import minioClient from '../src/config/minio.js';

async function checkFiles() {
  try {
    // Get a sample file from database
    const result = await db.query('SELECT * FROM files LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('❌ No files found in database');
      process.exit(0);
    }

    const file = result.rows[0];
    console.log('\n📄 Sample File:');
    console.log(`   Filename: ${file.original_name}`);
    console.log(`   MinIO Key: ${file.minio_key}`);
    console.log(`   Thumbnail Key: ${file.thumbnail_key}`);
    console.log(`   Folder ID: ${file.folder_id}`);

    // Generate URLs
    const minioEndpoint = 'http://minio.jameskaranja.me:9000';
    const originalUrl = `${minioEndpoint}/${minioClient.buckets.original}/${file.minio_key}`;
    const thumbnailUrl = file.thumbnail_key 
      ? `${minioEndpoint}/${minioClient.buckets.thumbnails}/${file.thumbnail_key}`
      : 'No thumbnail';

    console.log('\n🔗 Generated URLs:');
    console.log(`   Original: ${originalUrl}`);
    console.log(`   Thumbnail: ${thumbnailUrl}`);

    // Check if file exists in MinIO
    console.log('\n🔍 Checking if file exists in MinIO...');
    try {
      await minioClient.getClient().statObject(
        minioClient.buckets.original,
        file.minio_key
      );
      console.log('   ✅ Original file exists in MinIO');
    } catch (error) {
      console.log('   ❌ Original file NOT found in MinIO:', error.message);
    }

    if (file.thumbnail_key) {
      try {
        await minioClient.getClient().statObject(
          minioClient.buckets.thumbnails,
          file.thumbnail_key
        );
        console.log('   ✅ Thumbnail exists in MinIO');
      } catch (error) {
        console.log('   ❌ Thumbnail NOT found in MinIO:', error.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkFiles();
