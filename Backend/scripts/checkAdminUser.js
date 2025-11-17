import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      email: 'nagunurishashidhar432@gmail.com'
    });
    
    if (!adminUser) {
      console.error('❌ User not found!');
      process.exit(1);
    }
    
    console.log('\n📋 User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', adminUser.email);
    console.log('Username:', adminUser.username);
    console.log('Role:', adminUser.role);
    console.log('Badges:', adminUser.badges);
    console.log('Is Blocked:', adminUser.isBlocked);
    console.log('Has Password:', !!adminUser.password);
    console.log('Password Hash (first 20 chars):', adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'N/A');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (adminUser.role !== 'admin') {
      console.warn('⚠️  WARNING: User role is not "admin"!');
      console.log('Current role:', adminUser.role);
      console.log('To fix this, update the role in MongoDB or run the reset script.\n');
    } else {
      console.log('✅ User role is correctly set to "admin"\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdminUser();

