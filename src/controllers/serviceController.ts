import { Request, Response } from 'express';
import Service from '../models/Service';
import Joi from 'joi';

// Validation schemas
const serviceSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('Content Creator', 'Social Media Management', 'Social Media Advertising').required(),
  isActive: Joi.boolean().optional(),
  image: Joi.string().optional(),
});

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive } = req.query;
    const filter: any = {};

    if (category) filter.category = category;

    // Only filter by isActive if it's explicitly provided as a boolean
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === '1';
    }
    // If isActive is not provided, we don't filter by it at all, so all services are returned

    console.log('Service filter used:', filter); // Log the filter for debugging

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if the ID parameter is valid
    if (!req.params.id || req.params.id === 'undefined') {
      res.status(400).json({ success: false, message: 'Invalid service ID' });
      return;
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = { ...req.body };

    // If an image was uploaded, add the image path to the service data
    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
    }

    // Validate request body
    const { error } = serviceSchema.validate(body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const service = await Service.create(body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = { ...req.body };

    // If an image was uploaded, add the image path to the service data
    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
    }

    // Validate request body
    const { error } = serviceSchema.validate(body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};