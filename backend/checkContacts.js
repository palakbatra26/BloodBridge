const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bloodbridge')
.then(async () => {
  console.log('MongoDB connected successfully');
  
  // Define contact schema
  const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    subject: String,
    message: String
  }, {
    timestamps: true
  });
  
  const Contact = mongoose.model('Contact', contactSchema);
  
  // Retrieve all contacts
  try {
    const contacts = await Contact.find({});
    console.log('All contacts in database:');
    console.log(contacts);
    
    if (contacts.length === 0) {
      console.log('No contacts found in database');
    }
  } catch (err) {
    console.error('Error retrieving contacts:', err);
  } finally {
    mongoose.connection.close();
  }
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});