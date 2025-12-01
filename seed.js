const mongoose = require('mongoose');

// Define the Service model schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Content Creator', 'Social Media Management', 'Social Media Advertising'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Service = mongoose.model('Service', serviceSchema);

// Sample data to insert
const sampleServices = [
  {
    name: 'Content Creator',
    description: 'Professional content creation services for social media, blogs, and marketing materials. Our team creates engaging content that resonates with your audience and drives results.',
    category: 'Content Creator',
    price: 1500000,
  },
  {
    name: 'Social Media Management',
    description: 'Complete social media management including posting, community engagement, and analytics. We help grow your brand presence across all major platforms.',
    category: 'Social Media Management',
    price: 2000000,
  },
  {
    name: 'Social Media Advertising',
    description: 'Targeted social media ad campaigns on platforms like Facebook, Instagram, and LinkedIn. We create, manage, and optimize ads to maximize your ROI.',
    category: 'Social Media Advertising',
    price: 2500000,
  },
  {
    name: 'Influencer Partnership',
    description: 'Connect with relevant influencers to promote your brand and products. We manage the entire partnership process from selection to campaign execution.',
    category: 'Content Creator',
    price: 3000000,
  },
  {
    name: 'Brand Identity Design',
    description: 'Complete brand identity design including logo, color scheme, typography, and brand guidelines. We create a cohesive brand that stands out.',
    category: 'Social Media Advertising',
    price: 5000000,
  }
];

// Function to connect to MongoDB and seed data
const seedData = async () => {
  try {
    // Connect to MongoDB using the environment variable
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/inovix';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    
    console.log('Connected to MongoDB successfully');
    
    // Clear existing services (optional - remove if you don't want to clear)
    console.log('Clearing existing services...');
    await Service.deleteMany({});
    console.log('Existing services cleared');
    
    // Insert sample data
    console.log('Inserting sample services...');
    await Service.insertMany(sampleServices);
    console.log(`${sampleServices.length} services inserted successfully`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1); // Exit with error code
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}