#!/bin/sh
set -e

# MinIO Initialization Script
# This script creates buckets and sets policies for JHUB Gallery

echo "🚀 Initializing MinIO for JHUB Gallery..."

# Wait for MinIO to be ready (with timeout)
echo "⏳ Waiting for MinIO to be ready..."
TIMEOUT=120
ELAPSED=0
until curl -sf http://minio:9000/minio/health/live > /dev/null 2>&1; do
  echo "MinIO is unavailable - sleeping (${ELAPSED}s/${TIMEOUT}s)"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "❌ Timeout waiting for MinIO"
    exit 1
  fi
done

echo "✅ MinIO is ready!"

# Get credentials from environment or use defaults
MINIO_USER=${MINIO_ROOT_USER:-minioadmin}
MINIO_PASS=${MINIO_ROOT_PASSWORD:-minioadmin123}
BUCKET_ORIGINAL=${MINIO_BUCKET_ORIGINAL:-jhub-photos-original}
BUCKET_THUMBNAILS=${MINIO_BUCKET_THUMBNAILS:-jhub-photos-thumbnails}

# Configure mc (MinIO Client)
echo "🔧 Configuring MinIO client..."
mc alias set myminio http://minio:9000 $MINIO_USER $MINIO_PASS || {
  echo "❌ Failed to configure MinIO client"
  exit 1
}

# Create buckets
echo "📦 Creating buckets..."
if mc mb myminio/$BUCKET_ORIGINAL --ignore-existing; then
  echo "✅ Created bucket: $BUCKET_ORIGINAL"
else
  echo "✅ Bucket already exists: $BUCKET_ORIGINAL"
fi

if mc mb myminio/$BUCKET_THUMBNAILS --ignore-existing; then
  echo "✅ Created bucket: $BUCKET_THUMBNAILS"
else
  echo "✅ Bucket already exists: $BUCKET_THUMBNAILS"
fi

# Set public read policy on thumbnails bucket
echo "🔓 Setting public read policy on thumbnails bucket..."
cat > /tmp/policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$BUCKET_THUMBNAILS/*"]
    }
  ]
}
EOF

if mc anonymous set-json /tmp/policy.json myminio/$BUCKET_THUMBNAILS; then
  echo "✅ Set public read policy for: $BUCKET_THUMBNAILS"
else
  echo "⚠️  Failed to set policy on thumbnails bucket, continuing..."
fi

# Set public read policy on original photos bucket (for direct image access)
echo "🔓 Setting public read policy on original photos bucket..."
cat > /tmp/policy-original.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$BUCKET_ORIGINAL/*"]
    }
  ]
}
EOF

if mc anonymous set-json /tmp/policy-original.json myminio/$BUCKET_ORIGINAL; then
  echo "✅ Set public read policy for: $BUCKET_ORIGINAL"
else
  echo "⚠️  Failed to set policy on original bucket, continuing..."
fi

# Set versioning on original photos bucket
echo "📝 Enabling versioning on original photos bucket..."
mc version enable myminio/$BUCKET_ORIGINAL || {
  echo "⚠️  Failed to enable versioning, continuing..."
}

# Display bucket information
echo ""
echo "✅ MinIO initialization complete!"
echo ""
echo "📊 Bucket Information:"
mc ls myminio || echo "Could not list buckets"

echo ""
echo "🎉 JHUB Gallery MinIO setup completed successfully!"
echo ""

# Ensure script exits with success
exit 0
