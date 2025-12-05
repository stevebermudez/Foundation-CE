import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

let transporter: nodemailer.Transporter | null = null;

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const config = getEmailConfig();
  if (!config) {
    console.warn("Email not configured: SMTP_HOST, SMTP_USER, and SMTP_PASS are required");
    return null;
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log("Email skipped (not configured):", options.subject);
    return false;
  }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "FoundationCE";

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
    console.log("Email sent successfully:", options.subject, "to", options.to);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  
  if (!adminEmail) {
    console.log("Contact form email skipped: no admin email configured");
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 100px;">From:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Subject:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Message:</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${data.message}</div>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          Received on ${new Date().toLocaleString()}
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Contact Form] ${data.subject}`,
    html,
  });
}

export async function sendEnrollmentConfirmationEmail(data: {
  studentEmail: string;
  studentName: string;
  courseName: string;
  courseHours: number;
  purchaseAmount: number;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to FoundationCE!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your enrollment is confirmed</p>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; color: #374151;">Hi ${data.studentName},</p>
        <p style="font-size: 16px; color: #374151;">Thank you for enrolling in your continuing education course! You're on your way to completing your requirements.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Course Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Course:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.courseName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.courseHours} Hours</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #059669;">$${(data.purchaseAmount / 100).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Getting Started</h3>
          <ol style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">Log in to your dashboard at <a href="https://www.foundationce.com/dashboard" style="color: #2563eb;">foundationce.com/dashboard</a></li>
            <li style="margin-bottom: 8px;">Start with Unit 1 and work through each lesson</li>
            <li style="margin-bottom: 8px;">Complete the quiz at the end of each unit</li>
            <li style="margin-bottom: 8px;">Pass the final exam to earn your certificate</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #6b7280;">If you have any questions, reply to this email or visit our <a href="https://www.foundationce.com/contact" style="color: #2563eb;">contact page</a>.</p>
      </div>
      <div style="padding: 20px; background: #1f2937; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">FoundationCE - Professional Continuing Education</p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 11px;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: data.studentEmail,
    subject: `Enrollment Confirmed: ${data.courseName}`,
    html,
  });
}

export async function sendCertificateEmail(data: {
  studentEmail: string;
  studentName: string;
  courseName: string;
  courseHours: number;
  completionDate: Date;
  certificateHtml: string;
}): Promise<boolean> {
  const completionDateStr = data.completionDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">You've completed your course</p>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; color: #374151;">Dear ${data.studentName},</p>
        <p style="font-size: 16px; color: #374151;">Congratulations on successfully completing your continuing education course! Your dedication and hard work have paid off.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Course Completion Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Course:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.courseName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Hours Earned:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.courseHours} Hours</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Completion Date:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #7c3aed;">${completionDateStr}</td>
            </tr>
          </table>
        </div>

        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; border: 1px solid #e9d5ff; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; color: #6b21a8; font-weight: bold;">Your Certificate is Attached</p>
          <p style="margin: 0; color: #7c3aed; font-size: 14px;">Open the attached HTML file in any web browser to view and print your official certificate of completion.</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">Keep your certificate for your records</li>
            <li style="margin-bottom: 8px;">Submit to the appropriate regulatory authority if required</li>
            <li style="margin-bottom: 8px;">Download additional copies anytime from your dashboard</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #6b7280;">Thank you for choosing FoundationCE for your continuing education needs!</p>
      </div>
      <div style="padding: 20px; background: #1f2937; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">FoundationCE - Professional Continuing Education</p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 11px;">www.foundationce.com</p>
      </div>
    </div>
  `;

  const sanitizedName = data.studentName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const dateStr = data.completionDate.toISOString().split("T")[0];
  const filename = `certificate-${sanitizedName}-${dateStr}.html`;

  return sendEmail({
    to: data.studentEmail,
    subject: `Your Certificate: ${data.courseName}`,
    html,
    attachments: [
      {
        filename,
        content: data.certificateHtml,
        contentType: "text/html",
      },
    ],
  });
}

export function isEmailConfigured(): boolean {
  return !!getEmailConfig();
}
