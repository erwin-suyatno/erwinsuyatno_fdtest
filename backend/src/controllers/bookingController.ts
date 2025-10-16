import type { Request, Response } from 'express';
import '../types';
import {
  createBookingService,
  getBookingByIdService,
  listBookingsService,
  updateBookingStatusService,
  returnBookingService,
  deleteBookingService,
} from '../services/bookingService';

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking request
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - borrowDate
 *               - returnDate
 *             properties:
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the book to book
 *               borrowDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the book will be borrowed
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 description: Expected return date
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input or book not available
 *       401:
 *         description: Unauthorized
 */
export async function create(req: Request, res: Response) {
  try {
    const booking = await createBookingService({
      ...req.body,
      userId: (req as any).user?.userId!,
    });
    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, RETURNED, OVERDUE]
 *         description: Filter by booking status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in book title, author, or user name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User's bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
export async function getMyBookings(req: Request, res: Response) {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;

    const result = await listBookingsService({
      userId: (req as any).user?.userId,
      status,
      search,
      page,
      limit,
    });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by book ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, RETURNED, OVERDUE]
 *         description: Filter by booking status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in book title, author, or user name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: All bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function list(req: Request, res: Response) {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const bookId = typeof req.query.bookId === 'string' ? req.query.bookId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;

    const result = await listBookingsService({
      userId,
      bookId,
      status,
      search,
      page,
      limit,
    });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await getBookingByIdService(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   put:
 *     summary: Approve a booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function approve(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await updateBookingStatusService(id, { status: 'APPROVED' });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   put:
 *     summary: Reject a booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function reject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await updateBookingStatusService(id, { status: 'REJECTED' });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/{id}/return:
 *   put:
 *     summary: Mark a book as returned
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualReturnDate:
 *                 type: string
 *                 format: date-time
 *                 description: Actual return date (defaults to current date)
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input or booking cannot be returned
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
export async function returnBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await returnBookingService(id, req.body);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (only pending bookings)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       204:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking cannot be cancelled
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await deleteBookingService(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
