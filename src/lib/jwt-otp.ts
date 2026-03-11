import jwt from "jsonwebtoken";

const OTP_SECRET = process.env.OTP_SECRET || "super-secret-otp-key";

export function createOtpToken(email: string, otp: string) {
  return jwt.sign(
    {
      email,
      otp,
      exp: Math.floor(Date.now() / 1000) + 10 * 60 // 10 mins expiry
    },
    OTP_SECRET
  );
}

export function verifyOtpToken(token: string) {
  try {
    return jwt.verify(token, OTP_SECRET) as { email: string; otp: string };
  } catch {
    return null;
  }
}
