import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Define interface for Order document
export interface IOrder extends Document {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  slotId: Types.ObjectId;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'expired';
  orderStatus: 'pending' | 'approved' | 'completed';
  midtransTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Schema
const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduleSlot',
      required: [true, 'Slot ID is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'expired'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'approved', 'completed'],
      default: 'pending',
    },
    midtransTransactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;