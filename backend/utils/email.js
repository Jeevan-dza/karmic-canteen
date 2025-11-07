// email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password (not Gmail password)
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Karmic Canteen" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📩 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email sending error:', err);
  }
};
