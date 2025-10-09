const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Set a timeout to avoid hanging
setTimeout(() => {
  console.log('Test timed out after 10 seconds');
  process.exit(1);
}, 10000);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Parse the connection string to verify format
    const uri = process.env.MONGODB_URI;
    console.log('Connection string format check:');
    console.log('- Contains mongodb+srv:', uri.includes('mongodb+srv://'));
    console.log('- Contains username:', uri.includes('palakbatra26'));
    console.log('- Contains cluster:', uri.includes('cluster0.mdj5ayi.mongodb.net'));
    console.log('- Contains database:', uri.includes('bloodbridge'));
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      dbName: 'bloodbridge' // Explicitly specify database name
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    console.log('Testing simple database operation...');
    const testSchema = new mongoose.Schema({ test: String, createdAt: { type: Date, default: Date.now } });
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
    console.error('MongoDB connection error:', error.name, error.message);
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    process.exit(1);
  }
};

connectDB();