import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

// Generate unique ticket number
function generateTicketNumber() {
  const prefix = 'GBS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * @route   POST /api/v1/support/tickets
 * @desc    Create new support ticket
 * @access  Public
 */
export async function createTicket(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      userType,
      subject,
      category,
      priority,
      message,
      attachmentUrl,
    } = req.body;

    // Generate unique ticket number
    const ticketNumber = generateTicketNumber();

    // Get userId if authenticated
    const userId = req.user?.id || null;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        fullName,
        email,
        phone,
        company,
        userType,
        subject,
        category: category || 'GENERAL_INQUIRY',
        priority: priority || 'MEDIUM',
        message,
        attachmentUrl,
        userId,
        status: 'OPEN',
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return successResponse(res, 201, 'Support ticket created successfully', ticket);
  } catch (err) {
    console.error('Create ticket error:', err);
    return errorResponse(res, 500, 'Failed to create support ticket');
  }
}

/**
 * @route   GET /api/v1/support/tickets
 * @desc    Get all tickets (admin) or user's tickets
 * @access  Private
 */
export async function getTickets(req, res) {
  try {
    const { status, category, priority, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // If not admin, only show user's tickets
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    // Filters
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true },
          },
          assignedTo: {
            select: { id: true, email: true, fullName: true },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return successResponse(res, 200, 'Tickets fetched successfully', {
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get tickets error:', err);
    return errorResponse(res, 500, 'Failed to fetch tickets');
  }
}

/**
 * @route   GET /api/v1/support/tickets/:id
 * @desc    Get single ticket by ID
 * @access  Private
 */
export async function getTicketById(req, res) {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        assignedTo: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (!ticket) {
      return errorResponse(res, 404, 'Ticket not found');
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
      return errorResponse(res, 403, 'Unauthorized to view this ticket');
    }

    return successResponse(res, 200, 'Ticket fetched successfully', ticket);
  } catch (err) {
    console.error('Get ticket error:', err);
    return errorResponse(res, 500, 'Failed to fetch ticket');
  }
}

/**
 * @route   PATCH /api/v1/support/tickets/:id
 * @desc    Update ticket (admin only)
 * @access  Admin
 */
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId, adminNotes } = req.body;

    // Only admins can update tickets
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Unauthorized');
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Set resolvedAt if status is RESOLVED or CLOSED
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
        assignedTo: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    // TODO: Send email notification to user about status change

    return successResponse(res, 200, 'Ticket updated successfully', ticket);
  } catch (err) {
    console.error('Update ticket error:', err);
    return errorResponse(res, 500, 'Failed to update ticket');
  }
}

/**
 * @route   DELETE /api/v1/support/tickets/:id
 * @desc    Delete ticket (admin only)
 * @access  Admin
 */
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;

    // Only admins can delete tickets
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Unauthorized');
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    return successResponse(res, 200, 'Ticket deleted successfully');
  } catch (err) {
    console.error('Delete ticket error:', err);
    return errorResponse(res, 500, 'Failed to delete ticket');
  }
}

/**
 * @route   GET /api/v1/support/stats
 * @desc    Get ticket statistics (admin only)
 * @access  Admin
 */
export async function getTicketStats(req, res) {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Unauthorized');
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      highPriorityTickets,
      urgentTickets,
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      prisma.supportTicket.count({ where: { priority: 'HIGH' } }),
      prisma.supportTicket.count({ where: { priority: 'URGENT' } }),
    ]);

    const stats = {
      total: totalTickets,
      byStatus: {
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      byPriority: {
        high: highPriorityTickets,
        urgent: urgentTickets,
      },
    };

    return successResponse(res, 200, 'Statistics fetched successfully', stats);
  } catch (err) {
    console.error('Get stats error:', err);
    return errorResponse(res, 500, 'Failed to fetch statistics');
  }
}
