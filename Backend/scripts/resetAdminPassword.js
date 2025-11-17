import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      email: 'nagunurishashidhar432@gmail.com',
      role: 'admin'
    });
    
    if (!adminUser) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log('📧 Found admin user:', adminUser.email);
    console.log('🔐 Resetting password to: Shashi@78');
    
    // Set the new password (plain text - the pre-save hook will hash it)
    adminUser.password = 'Shashi@78';
    
    // Save the user - this will trigger the pre-save hook to hash the password
    await adminUser.save();
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email: nagunurishashidhar432@gmail.com');
    console.log('🔑 New Password: Shashi@78');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();

