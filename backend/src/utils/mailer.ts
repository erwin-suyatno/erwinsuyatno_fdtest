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
  return `<p>Reset your password by clicking the link below:</p>
<p><a href="${link}">${link}</a></p>`;
}
