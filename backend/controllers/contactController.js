const Contact = require('../models/Contact');

// Handle contact form submission
const submitContactForm = async (req, res) => {
  try {
    console.log('Received contact form data:', req.body);
    const { firstName, lastName, email, phone, subject, message } = req.body;
    
    const contact = new Contact({ firstName, lastName, email, phone, subject, message });
    console.log('Creating contact document:', contact);
    
    const savedContact = await contact.save();
    console.log('Contact saved successfully:', savedContact);
    
    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      data: savedContact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
};

module.exports = {
  submitContactForm
};