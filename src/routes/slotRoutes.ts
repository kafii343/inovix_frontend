import express from 'express';
import { 
  getAllScheduleSlots, 
  getScheduleSlotById, 
  createScheduleSlot, 
  updateScheduleSlot, 
  deleteScheduleSlot,
  getAvailableSlots
} from '../controllers/slotController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllScheduleSlots);
router.get('/available', getAvailableSlots);
router.get('/:id', getScheduleSlotById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createScheduleSlot);
router.put('/:id', authenticate, authorizeAdmin, updateScheduleSlot);
router.delete('/:id', authenticate, authorizeAdmin, deleteScheduleSlot);

export default router;