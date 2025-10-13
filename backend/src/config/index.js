import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'jhub_gallery',
    user: process.env.POSTGRES_USER || 'jhub_admin',
    password: process.env.POSTGRES_PASSWORD || 'jhub_password',
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for external DB
    // SSL configuration for external databases (like Neon)
    ssl: process.env.POSTGRES_SSLMODE === 'require' ? {
      rejectUnauthorized: false, // For cloud databases
    } : false,
  },

  // MinIO
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    buckets: {
      original: process.env.MINIO_BUCKET_ORIGINAL || 'jhub-photos-original',
      thumbnails: process.env.MINIO_BUCKET_THUMBNAILS || 'jhub-photos-thumbnails',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
    maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD || '500', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Thumbnail
  thumbnail: {
    width: parseInt(process.env.THUMBNAIL_WIDTH || '400', 10),
    height: parseInt(process.env.THUMBNAIL_HEIGHT || '400', 10),
    quality: parseInt(process.env.THUMBNAIL_QUALITY || '80', 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Share Links
  shareLink: {
    expiryDays: parseInt(process.env.SHARE_LINK_EXPIRY_DAYS || '30', 10),
  },
};

export default config;
