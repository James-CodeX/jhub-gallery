import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import db from './config/database.js';
import minioClient from './config/minio.js';

// Import routes
import folderRoutes from './routes/folderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// API root
app.get(`${config.apiPrefix}/`, (req, res) => {
  res.json({
    message: 'JHUB Africa Photo Gallery API',
    version: '1.0.0',
    endpoints: {
      folders: `${config.apiPrefix}/folders`,
      upload: `${config.apiPrefix}/upload`,
      files: `${config.apiPrefix}/files`,
      share: `${config.apiPrefix}/share`,
      download: `${config.apiPrefix}/download`,
    },
  });
});

// Mount API routes
app.use(`${config.apiPrefix}/folders`, folderRoutes);
app.use(`${config.apiPrefix}/upload`, uploadRoutes);
app.use(`${config.apiPrefix}/files`, fileRoutes);
app.use(`${config.apiPrefix}/share`, shareRoutes);
app.use(`${config.apiPrefix}/download`, downloadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Initialize connections and start server
async function startServer() {
  try {
    console.log('🚀 Starting JHUB Gallery Backend...\n');

    // Test database connection
    console.log('📊 Connecting to PostgreSQL...');
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Test MinIO connection and initialize buckets
    console.log('\n🗄️  Connecting to MinIO...');
    const minioConnected = await minioClient.testConnection();
    if (!minioConnected) {
      throw new Error('Failed to connect to MinIO');
    }

    console.log('\n🪣 Initializing MinIO buckets...');
    const bucketsInitialized = await minioClient.initializeBuckets();
    if (!bucketsInitialized) {
      console.warn('⚠️  Warning: Failed to initialize some buckets');
    }

    // Start Express server
    app.listen(config.port, () => {
      console.log(`\n✅ Server is running on port ${config.port}`);
      console.log(`🌐 API URL: http://localhost:${config.port}${config.apiPrefix}`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log(`\n📝 Environment: ${config.env}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

// Start the server
startServer();
