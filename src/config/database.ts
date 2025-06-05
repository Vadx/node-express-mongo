import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.MONGODB_TEST_URI 
  : process.env.MONGODB_URI;

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(MONGODB_URI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};