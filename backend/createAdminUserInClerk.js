const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function createAdminUser() {
  try {
    // Create a new user with email and password
    const user = await clerk.users.createUser({
      emailAddress: ['palakbatra79@gmail.com'],
      password: 'BloodbridgeAdmin2025!', // Strong password
      firstName: 'Palak',
      lastName: 'Batra'
    });
    
    console.log('User created successfully:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.emailAddresses[0].emailAddress);
    
    // Update user metadata to set admin role
    const updatedUser = await clerk.users.updateUser(user.id, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    console.log('User updated with admin role successfully!');
    console.log('Public metadata:', updatedUser.publicMetadata);
    console.log('Login credentials:');
    console.log('- Email: palakbatra79@gmail.com');
    console.log('- Password: BloodbridgeAdmin2025!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();