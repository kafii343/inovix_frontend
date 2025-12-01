import mongoose from 'mongoose';
import Service from './src/models/Service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Function to test the database connection and services
const testServices = async () => {
  try {
    // Connect to MongoDB using the environment variable
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/inovix';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    
    console.log('Connected to MongoDB successfully');
    
    // Count services
    const serviceCount = await Service.countDocuments({});
    console.log(`Number of services in database: ${serviceCount}`);
    
    // Get all services
    const services = await Service.find({});
    console.log('Services found in database:');
    services.forEach(service => {
      console.log(`- ${service.name} (${service.category}): Rp ${service.price.toLocaleString()}, Active: ${service.isActive}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during testing:', error);
    process.exit(1); // Exit with error code
  }
};

// Run the test function
testServices();