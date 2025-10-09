const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function listUsers() {
  try {
    // Get all users
    const users = await clerk.users.getUserList();
    
    console.log('Users in Clerk organization:');
    if (users && users.data && users.data.length > 0) {
      users.data.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.emailAddresses[0]?.emailAddress || 'No email'}`);
        console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
        console.log(`   Role: ${user.publicMetadata?.role || 'No role'}`);
        console.log('   ---');
      });
    } else {
      console.log('No users found.');
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();