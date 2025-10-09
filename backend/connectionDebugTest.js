const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Enable Mongoose debug mode
    mongoose.set('debug', true);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      dbName: 'bloodbridge',
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error event:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Test a simple operation
    console.log('Testing simple database operation...');
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    const testDoc = new TestModel({ test: 'Connection test' });
    const savedDoc = await testDoc.save();
    console.log('Test document saved successfully:', savedDoc._id);
    
    // Clean up
    await TestModel.deleteOne({ _id: savedDoc._id });
    console.log('Test document deleted');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection error:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    process.exit(1);
  }
};

// Set a timeout to avoid hanging indefinitely
setTimeout(() => {
  console.log('Test timed out after 15 seconds');
  process.exit(1);
}, 15000);

connectDB();