const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function resetAdminPassword() {
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
      
      // Create a stronger password that won't be flagged
      const newPassword = 'BloodbridgeAdmin2025!';
      
      // Update user password
      await clerk.users.updateUserPassword({
        userId: user.id,
        password: newPassword
      });
      
      console.log('User password updated successfully!');
      console.log('New password:', newPassword);
      
    } else {
      console.log('No user found with email:', email);
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

resetAdminPassword();