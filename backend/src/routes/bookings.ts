import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/adminAuth';
import {
  create,
  getMyBookings,
  list,
  getById,
  approve,
  reject,
  returnBook,
  remove,
} from '../controllers/bookingController';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

// User booking routes
router.post('/', create); // Create booking request
router.get('/my', getMyBookings); // Get user's bookings

// Admin booking routes (require admin role)
router.get('/', requireAdmin, list); // Get all bookings (admin)
router.get('/:id', getById); // Get booking by ID
router.put('/:id/approve', requireAdmin, approve); // Approve booking (admin)
router.put('/:id/reject', requireAdmin, reject); // Reject booking (admin)
router.put('/:id/return', returnBook); // Mark book as returned
router.delete('/:id', remove); // Cancel booking

export default router;
