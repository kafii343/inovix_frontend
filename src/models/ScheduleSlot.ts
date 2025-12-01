import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Define interface for ScheduleSlot document
export interface IScheduleSlot extends Document {
  serviceId: Types.ObjectId;
  date: Date;
  time: string;
  capacity: number;
  remainingCapacity: number;
  isAvailable: boolean;
  isSoldOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ScheduleSlot Schema
const ScheduleSlotSchema: Schema<IScheduleSlot> = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    remainingCapacity: {
      type: Number,
      required: [true, 'Remaining capacity is required'],
      min: [0, 'Remaining capacity cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Middleware to update isSoldOut status when remainingCapacity reaches 0
ScheduleSlotSchema.pre('save', function (next) {
  if (this.remainingCapacity <= 0) {
    this.isSoldOut = true;
    this.isAvailable = false;
  } else {
    this.isSoldOut = false;
    this.isAvailable = true;
  }
  next();
});

const ScheduleSlot: Model<IScheduleSlot> = mongoose.model<IScheduleSlot>(
  'ScheduleSlot',
  ScheduleSlotSchema
);
export default ScheduleSlot;