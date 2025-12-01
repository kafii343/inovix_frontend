import express from 'express';
import { createPayment, handleNotification } from '../controllers/paymentController';

const router = express.Router();

router.post('/create', createPayment);
router.post('/notification', handleNotification);

export default router;