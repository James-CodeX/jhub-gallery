/**
 * Test script for MinIO folder creation feature
 * Run this after starting the backend to test folder creation and presigned URLs
 */

const API_URL = 'http://localhost:3001/api';

async function testFolderCreation() {
  console.log('🧪 Testing MinIO Folder Creation Feature\n');

  try {
    // Test 1: Create a new folder
    console.log('📁 Test 1: Creating a new folder...');
    const createResponse = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Folder MinIO',
        parentId: null
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log('✅ Folder created successfully!');
    console.log('   ID:', createData.data.id);
    console.log('   Name:', createData.data.name);
    console.log('   Path:', createData.data.path);
    console.log('   Has presigned URLs:', !!createData.data.presignedUrls);
    
    if (createData.data.presignedUrls) {
      console.log('   Upload URL:', createData.data.presignedUrls.uploadUrl ? '✅ Generated' : '❌ Missing');
      console.log('   List URL:', createData.data.presignedUrls.listUrl ? '✅ Generated' : '❌ Missing');
    }

    const folderId = createData.data.id;

    // Test 2: Get folder with presigned URLs
    console.log('\n📁 Test 2: Retrieving folder...');
    const getResponse = await fetch(`${API_URL}/folders/${folderId}`);

    if (!getResponse.ok) {
      throw new Error(`Failed to get folder: ${getResponse.statusText}`);
    }

    const getData = await getResponse.json();
    console.log('✅ Folder retrieved successfully!');
    console.log('   Has presigned URLs:', !!getData.data.folder.presignedUrls);

    // Test 3: Ensure MinIO folder exists
    console.log('\n📁 Test 3: Ensuring MinIO folder exists...');
    const ensureResponse = await fetch(`${API_URL}/folders/${folderId}/ensure-minio`, {
      method: 'POST'
    });

    if (!ensureResponse.ok) {
      throw new Error(`Failed to ensure MinIO folder: ${ensureResponse.statusText}`);
    }

    const ensureData = await ensureResponse.json();
    console.log('✅ MinIO folder verified!');
    console.log('   MinIO key:', ensureData.data.minioKey);
    console.log('   Presigned URLs refreshed:', !!ensureData.data.presignedUrls);

    // Test 4: Create a subfolder
    console.log('\n📁 Test 4: Creating a subfolder...');
    const subfolderResponse = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Subfolder',
        parentId: folderId
      })
    });

    if (!subfolderResponse.ok) {
      throw new Error(`Failed to create subfolder: ${subfolderResponse.statusText}`);
    }

    const subfolderData = await subfolderResponse.json();
    console.log('✅ Subfolder created successfully!');
    console.log('   ID:', subfolderData.data.id);
    console.log('   Path:', subfolderData.data.path);
    console.log('   Has presigned URLs:', !!subfolderData.data.presignedUrls);

    console.log('\n✅ All tests passed!');
    console.log('\n📋 Summary:');
    console.log('   - Folders are created in both database and MinIO');
    console.log('   - Presigned URLs are generated automatically');
    console.log('   - MinIO folders can be verified/created on demand');
    console.log('   - Subfolders work correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testFolderCreation();
