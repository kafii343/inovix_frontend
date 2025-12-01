import mongoose, { Document, Schema, Model } from 'mongoose';

// Define interface for Service document
export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Schema
const ServiceSchema: Schema<IService> = new Schema(
  {
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
    image: {
      type: String,
      default: null, // Store the image URL or path
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Service: Model<IService> = mongoose.model<IService>('Service', ServiceSchema);
export default Service;