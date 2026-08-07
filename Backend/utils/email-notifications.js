/**
 * Email Notification Service for Support Tickets
 * 
 * INSTRUCTIONS:
 * 1. Install nodemailer: npm install nodemailer
 * 2. Add email credentials to .env.local:
 *    SMTP_HOST=smtp.gmail.com
 *    SMTP_PORT=587
 *    SMTP_USER=your-email@gmail.com
 *    SMTP_PASS=your-app-password
 *    ADMIN_EMAIL=admin@ghostbus.audio
 * 3. Uncomment the code below
 * 4. Import in support.controller.js and call functions
 */

/*
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email to admin when new ticket is created
export async function sendTicketCreatedAdminNotification(ticket) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🎫 New Support Ticket: ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A84FF 0%, #5BA7FF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Support Ticket</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Ticket Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
              <tr style="background: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; width: 150px;">Ticket Number:</td>
                <td style="padding: 12px;">${ticket.ticketNumber}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold;">From:</td>
                <td style="padding: 12px;">${ticket.fullName} (${ticket.email})</td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold;">Subject:</td>
                <td style="padding: 12px;">${ticket.subject}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold;">Category:</td>
                <td style="padding: 12px;">${ticket.category.replace(/_/g, ' ')}</td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold;">Priority:</td>
                <td style="padding: 12px;"><span style="background: ${getPriorityColor(ticket.priority)}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">${ticket.priority}</span></td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold;">User Type:</td>
                <td style="padding: 12px;">${ticket.userType}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937;">Message:</h3>
              <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${ticket.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/admin/support" 
                 style="display: inline-block; padding: 14px 28px; background: #0A84FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View in Admin Panel
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated notification from GhostBus Support System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent for ticket: ${ticket.ticketNumber}`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

// Send confirmation email to user
export async function sendTicketConfirmationEmail(ticket) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: ticket.email,
      subject: `Support Ticket Received - ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A84FF 0%, #5BA7FF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You for Contacting Us</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${ticket.fullName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              We've received your support request and our team will get back to you within 24-48 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Your Ticket Number</p>
              <p style="color: #0A84FF; font-size: 24px; font-weight: bold; margin: 0;">${ticket.ticketNumber}</p>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">Please save this number for future reference</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Request:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${ticket.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${ticket.category.replace(/_/g, ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Priority:</td>
                  <td style="padding: 8px 0;"><span style="background: ${getPriorityColor(ticket.priority)}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">${ticket.priority}</span></td>
                </tr>
              </table>
            </div>
            
            ${ticket.userId ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/account/support" 
                 style="display: inline-block; padding: 14px 28px; background: #0A84FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Track Your Ticket
              </a>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Need urgent help?</strong> For critical issues, please call us at +1 (234) 567-890
              </p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from GhostBus Support</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to: ${ticket.email}`);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

// Send status update notification to user
export async function sendStatusUpdateEmail(ticket) {
  try {
    const statusMessages = {
      OPEN: 'Your ticket is open and awaiting review.',
      IN_PROGRESS: 'Our team is currently working on your request.',
      RESOLVED: 'Your ticket has been resolved. Please let us know if you need further assistance.',
      CLOSED: 'Your ticket has been closed. Thank you for contacting GhostBus.',
    };

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: ticket.email,
      subject: `Ticket Update - ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A84FF 0%, #5BA7FF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Ticket Status Updated</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${ticket.fullName},</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Ticket Number</p>
              <p style="color: #0A84FF; font-size: 20px; font-weight: bold; margin: 0 0 16px 0;">${ticket.ticketNumber}</p>
              <div>
                <span style="background: ${getStatusBgColor(ticket.status)}; color: ${getStatusTextColor(ticket.status)}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                  ${ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              ${statusMessages[ticket.status]}
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/account/support" 
                 style="display: inline-block; padding: 14px 28px; background: #0A84FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Ticket Details
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated notification from GhostBus Support System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent for ticket: ${ticket.ticketNumber}`);
  } catch (error) {
    console.error('Failed to send status update email:', error);
  }
}

// Helper functions for colors
function getPriorityColor(priority) {
  switch (priority) {
    case 'LOW': return '#e5e7eb';
    case 'MEDIUM': return '#dbeafe';
    case 'HIGH': return '#fed7aa';
    case 'URGENT': return '#fecaca';
    default: return '#e5e7eb';
  }
}

function getStatusBgColor(status) {
  switch (status) {
    case 'OPEN': return '#dbeafe';
    case 'IN_PROGRESS': return '#fef3c7';
    case 'RESOLVED': return '#d1fae5';
    case 'CLOSED': return '#e5e7eb';
    default: return '#e5e7eb';
  }
}

function getStatusTextColor(status) {
  switch (status) {
    case 'OPEN': return '#1e40af';
    case 'IN_PROGRESS': return '#92400e';
    case 'RESOLVED': return '#065f46';
    case 'CLOSED': return '#1f2937';
    default: return '#1f2937';
  }
}
*/

// Placeholder exports (remove when uncommenting above)
export function sendTicketCreatedAdminNotification(ticket) {
  console.log('Email notification (not configured):', ticket.ticketNumber);
}

export function sendTicketConfirmationEmail(ticket) {
  console.log('Confirmation email (not configured):', ticket.email);
}

export function sendStatusUpdateEmail(ticket) {
  console.log('Status update email (not configured):', ticket.ticketNumber);
}
