// Test donor registration API
fetch('http://localhost:5000/api/auth/register-donor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    dateOfBirth: '1990-01-01',
    bloodType: 'O+',
    gender: 'male',
    weight: 70,
    address: '123 Main St',
    city: 'City',
    state: 'State',
    pincode: '123456',
    medicalHistory: 'No significant medical history',
    lastDonation: '2025-01-01',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '0987654321'
  }),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch((error) => console.error('Error:', error));