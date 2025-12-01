import express from 'express';
import upload from '../utils/upload';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createService);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateService);
router.delete('/:id', authenticate, authorizeAdmin, deleteService);

export default router;