const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bloodbridge')
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Test creating a document
  const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
  });
  
  const Contact = mongoose.model('Contact', contactSchema);
  
  const testContact = new Contact({
    firstName: 'Test',
    lastName: 'User'
  });
  
  testContact.save()
    .then(() => {
      console.log('Test document saved successfully');
      mongoose.connection.close();
    })
    .catch(err => {
      console.error('Error saving test document:', err);
      mongoose.connection.close();
    });
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});