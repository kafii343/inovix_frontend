import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Service from '../models/Service';
import ScheduleSlot from '../models/ScheduleSlot';
import Joi from 'joi';

// Validation schemas
const orderSchema = Joi.object({
  serviceId: Joi.string().required(),
  slotId: Joi.string().required(),
  totalPrice: Joi.number().min(0).required(),
});

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, serviceId, paymentStatus, orderStatus } = req.query;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (serviceId) filter.serviceId = serviceId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (orderStatus) filter.orderStatus = orderStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('serviceId', 'name price category')
      .populate('slotId', 'date time')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('serviceId', 'name price category')
      .populate('slotId', 'date time');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error } = orderSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const { serviceId, slotId, totalPrice } = req.body;

    // Verify user exists
    const user = await User.findById(req.body.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    // Verify schedule slot exists and is available
    const slot = await ScheduleSlot.findById(slotId);
    if (!slot) {
      res.status(404).json({ success: false, message: 'Schedule slot not found' });
      return;
    }

    if (!slot.isAvailable || slot.isSoldOut) {
      res.status(400).json({ success: false, message: 'Selected slot is not available' });
      return;
    }

    // Check if remaining capacity is sufficient
    if (slot.remainingCapacity <= 0) {
      res.status(400).json({ success: false, message: 'Selected slot is sold out' });
      return;
    }

    // Create the order
    const order = await Order.create({
      userId: user._id,
      serviceId: service._id,
      slotId: slot._id,
      totalPrice,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    // Decrease remaining capacity
    await ScheduleSlot.findByIdAndUpdate(slotId, {
      $inc: { remainingCapacity: -1 }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const allowedUpdates = ['paymentStatus', 'orderStatus', 'midtransTransactionId'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({ success: false, message: 'Invalid updates!' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('serviceId', 'name price category')
      .populate('slotId', 'date time');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ userId: req.body.user.id })
      .populate('serviceId', 'name price category')
      .populate('slotId', 'date time')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};