import db from '../src/config/database.js';
import minioClient from '../src/config/minio.js';

/**
 * Migration script to create MinIO folders for all existing database folders
 * This ensures that all folders in the database have corresponding folders in MinIO
 */
async function migrateFoldersToMinio() {
  console.log('🚀 Starting folder migration to MinIO...\n');

  try {
    // Get all folders from database
    const result = await db.query(
      'SELECT id, name, path FROM folders ORDER BY path ASC'
    );

    const folders = result.rows;
    console.log(`📁 Found ${folders.length} folders in database\n`);

    let created = 0;
    let existing = 0;
    let failed = 0;

    for (const folder of folders) {
      const minioFolderKey = `${folder.id}/.folder`;

      try {
        // Check if folder marker already exists
        await minioClient.getClient().statObject(
          minioClient.buckets.original,
          minioFolderKey
        );
        console.log(`✅ ${folder.path} - MinIO folder already exists`);
        existing++;
      } catch (error) {
        // Folder doesn't exist, create it
        try {
          await minioClient.getClient().putObject(
            minioClient.buckets.original,
            minioFolderKey,
            Buffer.from(''),
            0,
            {
              'Content-Type': 'application/x-directory'
            }
          );
          console.log(`✨ ${folder.path} - Created MinIO folder`);
          created++;
        } catch (createError) {
          console.error(`❌ ${folder.path} - Failed to create MinIO folder:`, createError.message);
          failed++;
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✨ Created: ${created}`);
    console.log(`   ✅ Already existing: ${existing}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total: ${folders.length}`);
    
    console.log('\n✅ Folder migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateFoldersToMinio();
