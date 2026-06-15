import dotenv from 'dotenv';
import path from 'path';

// Load environmental parameters immediately at initialization
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Ensure database layer is active before listening to incoming socket frames
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Gateway Server deployed successfully in [${process.env.NODE_ENV}] mode on port: ${PORT}`);
  });

  // Handle unhandled promise rejections globally
  process.on('unhandledRejection', (err: Error) => {
    console.error('💥 Unhandled Rejection detected. Shuting down system server context...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();