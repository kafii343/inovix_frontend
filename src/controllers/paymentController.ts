import { Request, Response } from 'express';
import midtransClient from 'midtrans-client';
import Order from '../models/Order';
import Service from '../models/Service';
import { Types } from 'mongoose';

// Define the populated order type for better type safety
interface IPopulatedOrder {
  _id: Types.ObjectId;
  serviceId: {
    _id: Types.ObjectId;
    name: string;
  };
  slotId: Types.ObjectId;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'expired';
  midtransTransactionId?: string;
  save(): Promise<any>;
}

// Initialize Midtrans client
let snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;

    // Find the order and populate serviceId to access service details
    const order = await Order.findById(orderId).populate('serviceId', 'name');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.paymentStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'Order is not pending payment' });
      return;
    }

    // Cast to the populated order interface to access service details
    const populatedOrder = order as any as IPopulatedOrder;

    // Prepare transaction parameters
    const transactionParams = {
      transaction_details: {
        order_id: order._id.toString(),
        gross_amount: order.totalPrice,
      },
      item_details: [
        {
          id: populatedOrder.serviceId._id.toString(),
          price: order.totalPrice,
          quantity: 1,
          name: populatedOrder.serviceId.name,
        },
      ],
      customer_details: {
        first_name: 'Customer', // This should be dynamic based on user
        email: 'customer@example.com', // This should be dynamic based on user
      },
    };

    // Create snap token
    const token = await snap.createTransaction(transactionParams);

    // Update order with transaction ID
    order.midtransTransactionId = token.transaction_id;
    await order.save();

    res.status(200).json({
      success: true,
      token: token.token,
      redirect_url: token.redirect_url,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const handleNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = req.body;

    // Get transaction status
    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Handle transaction status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // TODO: Handle challenged transaction
        order.paymentStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        order.paymentStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      order.paymentStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
      order.paymentStatus = 'expired';
      // Restore capacity if payment expired/cancelled
      await restoreSlotCapacity(order.slotId.toString());
    } else if (transactionStatus === 'pending') {
      order.paymentStatus = 'pending';
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Notification handled successfully' });
  } catch (error) {
    console.error('Handle notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to restore slot capacity if payment is cancelled or expired
const restoreSlotCapacity = async (slotId: string) => {
  try {
    await ScheduleSlot.findByIdAndUpdate(slotId, {
      $inc: { remainingCapacity: 1 }
    });
  } catch (error) {
    console.error('Error restoring slot capacity:', error);
  }
};

// Import ScheduleSlot model for the helper function
import ScheduleSlot from '../models/ScheduleSlot';