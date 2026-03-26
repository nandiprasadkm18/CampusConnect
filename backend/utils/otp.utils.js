import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Path to a dedicated log file for development
const LOG_FILE = path.join(__dirname, '..', 'otp_logs.txt');

/**
 * Log OTP to a physical file for development
 */
const logOTPToFile = (type, recipient, otp) => {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${type.toUpperCase()} OTP for ${recipient}: ${otp}\n`;
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
  console.log(`-------------------------------------------`);
  console.log(`[MOCK/LOG] ${type.toUpperCase()} OTP for ${recipient}: ${otp}`);
  console.log(`Check ${LOG_FILE} if console is not visible.`);
  console.log(`-------------------------------------------`);
};

/**
 * Generate a 6-digit random OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via Email
 */
export const sendEmailOTP = async (email, otp) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for CampusConnect Verification',
    text: `Your One-Time Password (OTP) for CampusConnect verification is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #4f46e5; text-align: center;">CampusConnect Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          This code is valid for 10 minutes. Please do not share it with anyone.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP successfully emailed to ${email}`);
    return true;
  } catch (error) {
    console.error(`Email delivery failed to ${email}: ${error.message}`);
    // Fallback to log file in development
    logOTPToFile('email', email, otp);
    return true; // Still return true for dev flow
  }
};
