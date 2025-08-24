import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const deleteAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('🗑️  Deleting existing admin user...');

    // Find and delete admin user
    const deletedAdmin = await User.findOneAndDelete({ role: 'admin' });
    
    if (deletedAdmin) {
      console.log('✅ Admin user deleted successfully!');
      console.log('📧 Email:', deletedAdmin.email);
    } else {
      console.log('ℹ️  No admin user found to delete');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting admin user:', error);
    process.exit(1);
  }
};

deleteAdminUser();
