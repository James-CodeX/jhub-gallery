#!/bin/bash

# MinIO Initialization Script
# This script creates buckets and sets policies for JHUB Gallery

echo "🚀 Initializing MinIO for JHUB Gallery..."

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
until curl -s http://minio:9000/minio/health/live > /dev/null 2>&1; do
  echo "MinIO is unavailable - sleeping"
  sleep 2
done

echo "✅ MinIO is ready!"

# Get credentials from environment or use defaults
MINIO_USER=${MINIO_ROOT_USER:-minioadmin}
MINIO_PASS=${MINIO_ROOT_PASSWORD:-minioadmin123}
BUCKET_ORIGINAL=${MINIO_BUCKET_ORIGINAL:-jhub-photos-original}
BUCKET_THUMBNAILS=${MINIO_BUCKET_THUMBNAILS:-jhub-photos-thumbnails}

# Configure mc (MinIO Client)
mc alias set myminio http://minio:9000 $MINIO_USER $MINIO_PASS

# Create buckets
echo "📦 Creating buckets..."
mc mb myminio/$BUCKET_ORIGINAL --ignore-existing
mc mb myminio/$BUCKET_THUMBNAILS --ignore-existing

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

mc anonymous set-json /tmp/policy.json myminio/$BUCKET_THUMBNAILS

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

mc anonymous set-json /tmp/policy-original.json myminio/$BUCKET_ORIGINAL

# Set versioning on original photos bucket
echo "📝 Enabling versioning on original photos bucket..."
mc version enable myminio/$BUCKET_ORIGINAL

# Display bucket information
echo ""
echo "✅ MinIO initialization complete!"
echo ""
echo "📊 Bucket Information:"
mc ls myminio

echo ""
echo "🎉 JHUB Gallery MinIO setup completed successfully!"
