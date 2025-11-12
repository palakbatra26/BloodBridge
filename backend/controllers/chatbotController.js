const ChatbotConversation = require('../models/ChatbotConversation');
const BloodCamp = require('../models/BloodCamp');

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Intent detection
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  const intents = {
    find_camps: ['find', 'near', 'nearby', 'location', 'camp', 'blood bank', 'hospital', 'where'],
    eligibility: ['eligible', 'eligibility', 'can i donate', 'qualify', 'requirements'],
    registration: ['register', 'sign up', 'become donor', 'join'],
    faq: ['what', 'how', 'why', 'when', 'question', 'info', 'tell me'],
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    thanks: ['thank', 'thanks', 'appreciate']
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMsg.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
}

// Generate AI response
async function generateResponse(message, intent, userLocation) {
  const responses = {
    find_camps: userLocation 
      ? "I'll help you find nearby blood camps based on your location."
      : "I can help you find blood camps. Please share your location or enter your city name.",
    eligibility: "Let me help you check your donation eligibility. I'll need some information: your age, days since last donation, and hemoglobin level (optional).",
    registration: "Great! I can guide you through the donor registration process. Would you like to register now?",
    greeting: "Hello! I'm your BloodBridge AI assistant. I can help you find blood camps, check eligibility, register as a donor, or answer questions about blood donation.",
    thanks: "You're welcome! Is there anything else I can help you with today?",
    faq: "I'm here to answer your questions about blood donation. What would you like to know?",
    general: "I understand. I can help you with finding blood camps, checking donation eligibility, registering as a donor, or answering FAQs. What interests you?"
  };
  
  return responses[intent] || responses.general;
}

exports.processMessage = async (req, res) => {
  try {
    const { message, sessionId, userLocation, metadata } = req.body;
    const userId = req.auth?.userId || 'anonymous';

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    // Detect intent
    const intent = detectIntent(message);
    
    // Generate response
    const botResponse = await generateResponse(message, intent, userLocation);
    
    // Save conversation
    let conversation = await ChatbotConversation.findOne({ sessionId });
    
    if (!conversation) {
      conversation = new ChatbotConversation({
        userId,
        sessionId,
        messages: [],
        userLocation,
        metadata
      });
    }
    
    conversation.messages.push(
      { role: 'user', content: message, intent, timestamp: new Date() },
      { role: 'bot', content: botResponse, timestamp: new Date() }
    );
    
    if (userLocation) {
      conversation.userLocation = userLocation;
    }
    
    await conversation.save();
    
    res.json({
      response: botResponse,
      intent,
      sessionId
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.findNearbyCamps = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, city } = req.query;
    
    // Get all approved camps (case-insensitive)
    const camps = await BloodCamp.find({ 
      $or: [
        { status: 'Approved' },
        { status: 'approved' },
        { approved: true }
      ]
    });
    
    if (!camps || camps.length === 0) {
      return res.json({ camps: [], count: 0 });
    }
    
    // Format camps for response
    const formattedCamps = camps.map(camp => {
      const campObj = camp.toObject();
      const loc = String(campObj.location || "");
      const parts = loc.split(",").map(s => s.trim()).filter(Boolean);
      const cityPart = parts.slice(-1)[0] || "";
      const venuePart = parts.slice(0, -1).join(", ");
      
      return {
        id: String(campObj._id || ""),
        name: String(campObj.name || "Blood Camp"),
        venue: venuePart,
        city: cityPart,
        date: campObj.date ? new Date(campObj.date).toLocaleDateString() : undefined,
        time: campObj.time || (campObj.startTime && campObj.endTime ? `${campObj.startTime} - ${campObj.endTime}` : campObj.startTime || campObj.endTime || undefined),
        contactPhone: campObj.contactPhone || undefined,
        location: campObj.location,
        // For GPS-based search, we'd need actual coordinates
        // For now, return all camps and let frontend filter by city
        distance: latitude && longitude ? Math.random() * 50 : undefined // Placeholder
      };
    });
    
    // If city filter provided, filter by city
    let filteredCamps = formattedCamps;
    if (city) {
      const cityLower = city.toLowerCase();
      filteredCamps = formattedCamps.filter(camp => 
        camp.city.toLowerCase().includes(cityLower) ||
        camp.location?.toLowerCase().includes(cityLower)
      );
    }
    
    // Sort by distance if available, otherwise by date
    filteredCamps.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });
    
    // Limit to 10 results
    const limitedCamps = filteredCamps.slice(0, 10);
    
    res.json({
      camps: limitedCamps,
      count: limitedCamps.length
    });
  } catch (error) {
    console.error('Find nearby camps error:', error);
    res.status(500).json({ error: 'Failed to find nearby camps', message: error.message });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const { age, lastDonationDays, hemoglobin, weight, medicalConditions } = req.body;
    
    const checks = {
      age: { passed: age >= 18 && age <= 65, message: 'Age must be between 18-65 years' },
      weight: { passed: !weight || weight >= 50, message: 'Weight must be at least 50kg' },
      lastDonation: { passed: !lastDonationDays || lastDonationDays >= 56, message: 'Must wait at least 56 days between donations' },
      hemoglobin: { passed: !hemoglobin || hemoglobin >= 12.5, message: 'Hemoglobin must be at least 12.5 g/dL' },
      medical: { passed: !medicalConditions || medicalConditions.length === 0, message: 'No chronic medical conditions' }
    };
    
    const eligible = Object.values(checks).every(check => check.passed);
    const failedChecks = Object.entries(checks)
      .filter(([_, check]) => !check.passed)
      .map(([key, check]) => ({ criterion: key, message: check.message }));
    
    res.json({
      eligible,
      checks,
      failedChecks,
      message: eligible 
        ? 'You appear eligible to donate blood. Please confirm with medical screening at the camp.'
        : 'You may not be eligible at this time. Please review the requirements below.'
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const faqs = [
      {
        category: 'eligibility',
        question: 'Who can donate blood?',
        answer: 'Healthy individuals aged 18-65 years weighing at least 50kg can donate blood. You should be free from chronic illness and not have donated in the last 3 months.',
        tags: ['age', 'weight', 'health']
      },
      {
        category: 'eligibility',
        question: 'How often can I donate blood?',
        answer: 'You can donate whole blood every 3 months (4 times a year). For platelet donations, you can donate every 2 weeks.',
        tags: ['frequency', 'interval']
      },
      {
        category: 'process',
        question: 'Is blood donation safe?',
        answer: 'Yes, blood donation is completely safe. All equipment is sterile and used only once. The process is supervised by trained medical professionals.',
        tags: ['safety', 'sterile']
      },
      {
        category: 'process',
        question: 'How long does donation take?',
        answer: 'The actual donation takes 10-15 minutes. The entire process including registration and refreshments takes about 30-45 minutes.',
        tags: ['time', 'duration']
      },
      {
        category: 'preparation',
        question: 'What should I do before donating?',
        answer: 'Eat a healthy meal, drink plenty of fluids, get good sleep, and avoid alcohol for 24 hours before donation.',
        tags: ['preparation', 'food', 'hydration']
      },
      {
        category: 'recovery',
        question: 'How long does it take to recover?',
        answer: 'Your body replaces plasma within 24 hours. Red blood cells take 4-6 weeks to fully replenish.',
        tags: ['recovery', 'replenish']
      },
      {
        category: 'impact',
        question: 'How many lives can one donation save?',
        answer: 'A single blood donation can save up to 3 lives. Different blood components help multiple patients.',
        tags: ['impact', 'lives']
      },
      {
        category: 'impact',
        question: 'Why is blood donation important?',
        answer: 'Blood donation saves lives during emergencies, surgeries, and treats patients with blood disorders. There is no substitute for human blood.',
        tags: ['importance', 'emergency']
      }
    ];
    
    let filtered = faqs;
    
    if (category) {
      filtered = filtered.filter(faq => faq.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.tags.some(tag => tag.includes(searchLower))
      );
    }
    
    res.json({ faqs: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
};

exports.getConversationHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversation = await ChatbotConversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};
