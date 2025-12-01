import { Request, Response } from 'express';
import ScheduleSlot from '../models/ScheduleSlot';
import Service from '../models/Service';
import Joi from 'joi';

// Validation schemas
const scheduleSlotSchema = Joi.object({
  serviceId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  capacity: Joi.number().min(1).required(),
  remainingCapacity: Joi.number().min(0).required(),
  isAvailable: Joi.boolean().optional(),
  isSoldOut: Joi.boolean().optional(),
});

export const getAllScheduleSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, date, isAvailable, isSoldOut } = req.query;
    const filter: any = {};

    if (serviceId) filter.serviceId = serviceId;
    if (date) filter.date = new Date(date as string);
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isSoldOut !== undefined) filter.isSoldOut = isSoldOut === 'true';

    const slots = await ScheduleSlot.find(filter)
      .populate('serviceId', 'name price category')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error('Get schedule slots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getScheduleSlotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const slot = await ScheduleSlot.findById(req.params.id)
      .populate('serviceId', 'name price category');

    if (!slot) {
      res.status(404).json({ success: false, message: 'Schedule slot not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    console.error('Get schedule slot by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createScheduleSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error } = scheduleSlotSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    // Verify service exists
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    // Set remainingCapacity to capacity if not provided
    if (req.body.remainingCapacity === undefined) {
      req.body.remainingCapacity = req.body.capacity;
    }

    const slot = await ScheduleSlot.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Schedule slot created successfully',
      data: slot,
    });
  } catch (error) {
    console.error('Create schedule slot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateScheduleSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error } = scheduleSlotSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const slot = await ScheduleSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('serviceId', 'name price category');

    if (!slot) {
      res.status(404).json({ success: false, message: 'Schedule slot not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule slot updated successfully',
      data: slot,
    });
  } catch (error) {
    console.error('Update schedule slot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteScheduleSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const slot = await ScheduleSlot.findByIdAndDelete(req.params.id);

    if (!slot) {
      res.status(404).json({ success: false, message: 'Schedule slot not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule slot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, date } = req.query;
    const filter: any = { isAvailable: true, isSoldOut: false };

    if (serviceId) filter.serviceId = serviceId;
    if (date) filter.date = new Date(date as string);

    const slots = await ScheduleSlot.find(filter)
      .populate('serviceId', 'name price category')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};