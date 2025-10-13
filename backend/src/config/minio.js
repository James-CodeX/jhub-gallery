import { Client } from 'minio';
import config from '../config/index.js';

class MinIOClient {
  constructor() {
    this.client = new Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });

    this.buckets = config.minio.buckets;
  }

  async initializeBuckets() {
    try {
      // Create original photos bucket
      const originalExists = await this.client.bucketExists(this.buckets.original);
      if (!originalExists) {
        await this.client.makeBucket(this.buckets.original, 'us-east-1');
        console.log(`✅ Created bucket: ${this.buckets.original}`);
      } else {
        console.log(`✅ Bucket exists: ${this.buckets.original}`);
      }

      // Create thumbnails bucket
      const thumbnailExists = await this.client.bucketExists(this.buckets.thumbnails);
      if (!thumbnailExists) {
        await this.client.makeBucket(this.buckets.thumbnails, 'us-east-1');
        console.log(`✅ Created bucket: ${this.buckets.thumbnails}`);
      } else {
        console.log(`✅ Bucket exists: ${this.buckets.thumbnails}`);
      }

      // Set bucket policy for public read access on original photos
      const originalPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.buckets.original}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(
        this.buckets.original,
        JSON.stringify(originalPolicy)
      );
      console.log(`✅ Set public read policy for: ${this.buckets.original}`);

      // Set bucket policy for public read access on thumbnails
      const thumbnailPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.buckets.thumbnails}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(
        this.buckets.thumbnails,
        JSON.stringify(thumbnailPolicy)
      );
      console.log(`✅ Set public read policy for: ${this.buckets.thumbnails}`);

      return true;
    } catch (error) {
      console.error('❌ MinIO initialization error:', error.message);
      return false;
    }
  }

  async testConnection() {
    try {
      const buckets = await this.client.listBuckets();
      console.log('✅ MinIO connected successfully. Available buckets:', buckets.length);
      return true;
    } catch (error) {
      console.error('❌ MinIO connection failed:', error.message);
      return false;
    }
  }

  getClient() {
    return this.client;
  }
}

const minioClient = new MinIOClient();

export default minioClient;
