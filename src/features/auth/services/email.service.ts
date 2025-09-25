// Path: src/features/auth/services/email.service.ts
import nodemailer from "nodemailer";
import { Logger } from "../../../shared/utils/logger";
import { AppError } from "../../../shared/utils/errorHandler";
import { createEmailVerification } from "../repositories/auth.repository";
import { config } from "../../../shared/config/config";

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
  host: config.gmailHost,
  port: 587,
  secure: false,
  auth: { user: config.gmailUser, pass: config.gmailPass },
});

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const emailHTMLTemplate = (title: string, message: string, code: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    <h2 style="text-align: center; color: #333;">${title}</h2>
    <p>${message}</p>
    <div style="font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; padding: 15px; background-color: #f2f2f2;">${code}</div>
    <p style="font-size: 12px; color: #888;">This code will expire in 15 minutes.</p>
  </div>`;

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Kitevent" <${config.fromEmail}>`,
      to,
      subject,
      html,
    });
    Logger.info(`Email sent to ${to}`);
  } catch (error) {
    Logger.error(`Email service error for ${to}:`, error);
    throw new AppError("EMAIL_SERVICE_ERROR");
  }
};

export const sendVerificationEmail = async (
  email: string,
  fullName: string
) => {
  const code = generateVerificationCode();
  await createEmailVerification(email, code, "registration");
  const html = emailHTMLTemplate(
    "Verify Your Email",
    `Hi ${fullName}, please use the code below to verify your account.`,
    code
  );
  await sendEmail(email, "Your Verification Code", html);
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string
) => {
  const code = generateVerificationCode();
  await createEmailVerification(email, code, "password_reset");
  const html = emailHTMLTemplate(
    "Password Reset Request",
    `Hi ${fullName}, use this code to reset your password.`,
    code
  );
  await sendEmail(email, "Your Password Reset Code", html);
};

export const sendWelcomeEmail = async (email: string, fullName: string) => {
  const html = `<div style="font-family: sans-serif;"><h2>Welcome, ${fullName}!</h2><p>Your account is now verified. Enjoy using our platform!</p></div>`;
  await sendEmail(email, "Welcome to the Platform! 🎉", html);
};
