import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('🔐 Creating admin user...');
    console.log('⚠️  Make sure you changed the password in this script!');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user - CHANGE THIS PASSWORD!
    const adminPassword = 'Admin@78'; // ⚠️ CHANGE THIS TO YOUR PASSWORD!

    const adminUser = new User({
      username: 'admin',
      email: 'nagunurishashidhar432@gmail.com',
      password: adminPassword, // Use plain password, let the pre-save hook hash it
      role: 'admin',
      badges: ['admin', 'moderator']
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
