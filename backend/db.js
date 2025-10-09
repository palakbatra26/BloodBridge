const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("🟡 Attempting to connect to MongoDB...");
  console.log("🔗 URI:", process.env.MONGODB_URI);

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // ⏰ 10 seconds timeout
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }

  // Listen for errors after initial connect attempt
  mongoose.connection.on("error", (err) => {
    console.error("⚠️ Mongoose runtime error:", err.message);
  });
};

module.exports = connectDB;
