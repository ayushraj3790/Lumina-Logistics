import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Add timeout configuration
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return { success: true, skipped: true };
  }
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[Email sent] To: ${to} | Subject: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email failed] To: ${to} | Subject: ${subject} | Error: ${error.message}`);
    // Don't throw - return success to allow registration to continue
    return { success: true, emailFailed: true, error: error.message };
  }
};
