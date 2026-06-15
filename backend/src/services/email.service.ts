import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendHtmlEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"SaaSCommerce Platform" <noreply@saasecommerce.com>',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Email delivery infrastructure exception targeting [${to}]:`, error);
    throw new Error('Email delivery system failed execution');
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Welcome to SaaSCommerce, ${name}!</h2>
      <p>Thank you for establishing your profile registry. Your modern workspace configuration is complete.</p>
    </div>
  `;
  await sendHtmlEmail(email, 'Welcome to SaaSCommerce Platform!', html);
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your account registration profile:</p>
      <a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; background-color:#4F46E5; color:#fff; text-decoration:none; border-radius:5px; margin:20px 0;">Verify Account</a>
      <p>This verification payload expires within 24 hours.</p>
    </div>
  `;
  await sendHtmlEmail(email, 'Verify Your Core Identity Matrix', html);
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Password Reset Request</h2>
      <p>We received an execution directive requesting account password access modification.</p>
      <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#EF4444; color:#fff; text-decoration:none; border-radius:5px; margin:20px 0;">Reset Password</a>
      <p>If you did not initiate this directive, disregard this message. Link auto-expires in 1 hour.</p>
    </div>
  `;
  await sendHtmlEmail(email, 'Password Access Modification Directive', html);
};

export const sendOrderConfirmationEmail = async (email: string, orderId: string, total: number): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order. Transaction record reference: <strong>${orderId}</strong></p>
      <p>Total Charge: <strong>$${total.toFixed(2)} USD</strong></p>
    </div>
  `;
  await sendHtmlEmail(email, `Order Confirmation ${orderId}`, html);
};