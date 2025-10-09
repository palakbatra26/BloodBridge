const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function setupAdminUser() {
  try {
    // Look for the user with the specific email
    const email = 'palakbatra79@gmail.com';
    const userList = await clerk.users.getUserList({ emailAddress: [email] });
    
    // Check if userList exists and has data
    if (userList && userList.data && userList.data.length > 0) {
      const user = userList.data[0];
      console.log('User found:');
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
    } else {
      console.log('No user found with email:', email);
      console.log('Please create the user first in Clerk, then run this script again.');
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

setupAdminUser();