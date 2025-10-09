const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(databases => {
    console.log('Available databases:', databases.databases);
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Collections in bloodbridge database:', collections);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });