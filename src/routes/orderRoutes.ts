import express from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder,
  getUserOrders
} from '../controllers/orderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public route (authenticated users only)
router.post('/', authenticate, createOrder);

// User routes
router.get('/my-orders', authenticate, getUserOrders);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.get('/:id', authenticate, authorizeAdmin, getOrderById);
router.put('/:id', authenticate, authorizeAdmin, updateOrder);

export default router;