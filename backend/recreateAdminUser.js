const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function recreateAdminUser() {
  try {
    // Look for the user with the specific email
    const email = 'admin@bloodbridge.com';
    const userList = await clerk.users.getUserList({ emailAddress: [email] });
    
    // Check if userList exists and has data
    if (userList && userList.data && userList.data.length > 0) {
      const user = userList.data[0];
      console.log('Existing user found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.emailAddresses[0].emailAddress);
      
      // Delete the existing user
      await clerk.users.deleteUser(user.id);
      console.log('Existing user deleted successfully!');
    } else {
      console.log('No existing user found with email:', email);
    }
    
    // Create a new user with email and password
    const newUser = await clerk.users.createUser({
      emailAddress: ['admin@bloodbridge.com'],
      password: 'BloodbridgeAdmin2025!', // Strong password
      firstName: 'Admin',
      lastName: 'User'
    });
    
    console.log('New user created successfully:');
    console.log('- ID:', newUser.id);
    console.log('- Email:', newUser.emailAddresses[0].emailAddress);
    
    // Update user metadata to set admin role
    const updatedUser = await clerk.users.updateUser(newUser.id, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    console.log('User updated with admin role successfully!');
    console.log('Public metadata:', updatedUser.publicMetadata);
    console.log('Login credentials:');
    console.log('- Email: admin@bloodbridge.com');
    console.log('- Password: BloodbridgeAdmin2025!');
    
  } catch (error) {
    console.error('Error recreating admin user:', error);
  }
}

recreateAdminUser();