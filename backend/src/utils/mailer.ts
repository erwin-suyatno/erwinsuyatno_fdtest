import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

export async function sendMail(to: string, subject: string, html: string) {
  const from = process.env.MAIL_FROM || 'no-reply@example.com';
  return transporter.sendMail({ from, to, subject, html });
}

export function verificationEmailTemplate(link: string) {
  return `<p>Verify your email by clicking the link below:</p>
<p><a href="${link}">${link}</a></p>`;
}

export function resetPasswordEmailTemplate(link: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
        .button { 
          display: inline-block; 
          background-color: #007bff; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .security-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${link}" class="button">Reset My Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${link}</p>
          
          <div class="security-notice">
            <strong>Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>This link can only be used once</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged until you click the link above</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
          <p>This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
