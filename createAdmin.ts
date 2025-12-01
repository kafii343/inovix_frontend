import mongoose from 'mongoose';
import User from './src/models/User';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Function to create an admin user
const createAdminUser = async () => {
  try {
    // Connect to MongoDB using the environment variable
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/inovix';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    
    console.log('Connected to MongoDB successfully');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@inovix.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@inovix.com');
      console.log('Password: admin123');
      
      // Close the connection
      await mongoose.connection.close();
      console.log('Database connection closed');
      return;
    }
    
    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@inovix.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin'
    });
    
    await adminUser.save();
    
    console.log('Admin user created successfully');
    console.log('Email: admin@inovix.com');
    console.log('Password: admin123');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during admin creation:', error);
    process.exit(1); // Exit with error code
  }
};

// Run the function
createAdminUser();