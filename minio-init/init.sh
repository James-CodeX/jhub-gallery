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

# Configure mc (MinIO Client)
mc alias set myminio http://minio:9000 minioadmin minioadmin123

# Create buckets
echo "📦 Creating buckets..."
mc mb myminio/jhub-photos-original --ignore-existing
mc mb myminio/jhub-photos-thumbnails --ignore-existing

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
      "Resource": ["arn:aws:s3:::jhub-photos-thumbnails/*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/policy.json myminio/jhub-photos-thumbnails

# Set versioning on original photos bucket
echo "📝 Enabling versioning on original photos bucket..."
mc version enable myminio/jhub-photos-original

# Display bucket information
echo ""
echo "✅ MinIO initialization complete!"
echo ""
echo "📊 Bucket Information:"
mc ls myminio

echo ""
echo "🎉 JHUB Gallery MinIO setup completed successfully!"
