import nodemailer from "nodemailer";
import { createOtpToken } from "@/lib/jwt-otp";

// Generates a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateAndSendOtp(email: string, role: string) {
  const otp = generateOTP();
  const otpToken = createOtpToken(email.toLowerCase(), otp); // <-- JWT token
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

  // Email configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your MDR Admin OTP",
    text: `Your OTP for ${role} login is ${otp}. It expires in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} with OTP: ${otp}`);

    return {
      success: true,
      otpToken, // <-- RETURN JWT TOKEN IN RESPONSE
      otpExpiry,
    };

  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: "Email sending failed" };
  }
}

// ========== PASSWORD RESET (unchanged) ==========
export async function sendPasswordResetEmail(email: string, newPassword: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your MDR Account Password Has Been Reset",
      html: `
        <p>Dear User,</p>
        <p>Your MDR account password has been reset by an administrator.</p>
        <p><strong>New Password:</strong> ${newPassword}</p>
        <p>Please log in using this password and change it immediately after logging in.</p>
        <br/>
        <p>Regards,<br/>MDR Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return { success: false, error: "Failed to send password reset email" };
  }
}

export async function sendAccountStatusEmail(email: string, isActive: boolean) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = isActive
    ? "Your MDR Account Has Been Reactivated"
    : "Your MDR Account Has Been Disabled";

  const text = isActive
    ? `Hello,\n\nYour MDR account has been reactivated. You can now access your account and all features as usual.\n\nIf you did not request this, please contact support.`
    : `Hello,\n\nYour MDR account has been disabled by the administrator. You will not be able to access your account until it’s reactivated.\n\nIf this seems like an error, please contact support.`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  });

  console.log(`📩 ${isActive ? "Reactivation" : "Disable"} email sent to ${email}`);
}
