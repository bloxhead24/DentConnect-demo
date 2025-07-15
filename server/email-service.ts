import { MailService } from '@sendgrid/mail';
import { User, Practice, Appointment, Treatment } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not found. Email notifications will be disabled.');
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface BookingNotificationData {
  patient: User;
  practice: Practice;
  appointment: Appointment;
  treatment: Treatment;
}

export async function sendBookingNotification(data: BookingNotificationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email not sent: SENDGRID_API_KEY not configured');
    return false;
  }

  const { patient, practice, appointment, treatment } = data;
  
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a5a; border-bottom: 2px solid #2d5a5a; padding-bottom: 10px;">
        New Dental Appointment Booking
      </h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d5a5a; margin-top: 0;">Patient Information</h3>
        <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
        <p><strong>Email:</strong> ${patient.email}</p>
      </div>

      <div style="background: #e8f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d5a5a; margin-top: 0;">Appointment Details</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Treatment:</strong> ${treatment.name}</p>
        <p><strong>Category:</strong> ${treatment.category}</p>
      </div>

      <div style="background: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d5a5a; margin-top: 0;">Practice Information</h3>
        <p><strong>Practice:</strong> ${practice.name}</p>
        <p><strong>Address:</strong> ${practice.address}</p>
        <p><strong>Phone:</strong> ${practice.phone}</p>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>Action Required:</strong> Please confirm this appointment and contact the patient to arrange any necessary pre-appointment procedures.
        </p>
      </div>

      <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
        This booking was made through DentConnect. Please contact the patient directly to confirm the appointment details.
      </p>
    </div>
  `;

  try {
    await mailService.send({
      to: practice.email,
      from: 'noreply@dentconnect.co.uk',
      subject: `New Appointment Booking - ${formattedDate} at ${formattedTime}`,
      html: emailContent,
    });
    
    console.log('✅ Booking notification sent successfully to:', practice.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send booking notification:', error);
    return false;
  }
}

export async function sendWelcomeEmail(user: User, practice?: Practice): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email not sent: SENDGRID_API_KEY not configured');
    return false;
  }

  const isDentist = user.userType === 'dentist';
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a5a; border-bottom: 2px solid #2d5a5a; padding-bottom: 10px;">
        Welcome to DentConnect!
      </h2>
      
      <p>Dear ${user.firstName},</p>
      
      <p>Welcome to DentConnect, the platform that connects ${isDentist ? 'dental practices with patients' : 'patients with available dental appointments'}.</p>
      
      ${isDentist ? `
        <div style="background: #e8f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5a5a; margin-top: 0;">Your Practice</h3>
          <p><strong>Practice:</strong> ${practice?.name}</p>
          <p><strong>Practice Tag:</strong> ${practice?.practiceTag}</p>
          <p>You can now manage your appointment slots and receive booking notifications.</p>
        </div>
      ` : `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d5a5a; margin-top: 0;">Getting Started</h3>
          <p>You can now search for available dental appointments in your area and book instantly.</p>
        </div>
      `}

      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>
      The DentConnect Team</p>
    </div>
  `;

  try {
    await mailService.send({
      to: user.email,
      from: 'noreply@dentconnect.co.uk',
      subject: 'Welcome to DentConnect!',
      html: emailContent,
    });
    
    console.log('✅ Welcome email sent successfully to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
}