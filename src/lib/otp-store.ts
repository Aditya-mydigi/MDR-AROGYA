// Simple in-memory OTP store (use Redis or database in production)

interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  createdAt: number; // Track when the OTP was created for resetting attempts
}

const otpStore = new Map<string, OTPData>();

// Clean up expired OTPs every minute (more frequent for better accuracy)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      console.log(`Cleaning expired OTP for ${key} at ${new Date(now)}`);
      otpStore.delete(key);
    }
  }
}, 1 * 60 * 1000); // 1 minute interval

export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  console.log(`Generated OTP: ${otp}`);
  return otp;
}

export function storeOTP(email: string, otp: string): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  console.log(`Storing OTP for ${email}: ${otp}, expires at ${new Date(expiresAt)}`);
  otpStore.set(email.toLowerCase(), { // Normalize email to avoid case issues
    email: email.toLowerCase(),
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });
}

export function verifyOTP(email: string, otp: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const data = otpStore.get(normalizedEmail);
  console.log(`Verifying OTP for ${normalizedEmail}, Stored data:`, data); // Debug

  if (!data) {
    console.log(`No OTP data found for ${normalizedEmail}`);
    return false;
  }

  if (data.expiresAt < Date.now()) {
    console.log(`OTP expired for ${normalizedEmail} at ${new Date(data.expiresAt)}`);
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (Date.now() - data.createdAt > 60 * 60 * 1000) { // Reset attempts after 1 hour
    data.attempts = 0;
    data.createdAt = Date.now();
    console.log(`Reset attempts for ${normalizedEmail}`);
  }

  if (data.attempts >= 5) {
    console.log(`Max attempts (5) reached for ${normalizedEmail}`);
    otpStore.delete(normalizedEmail);
    return false;
  }

  data.attempts++;
  console.log(`Attempt ${data.attempts} for ${normalizedEmail}, Stored OTP: ${data.otp}, Entered OTP: ${otp}`);

  if (data.otp === otp) {
    console.log(`OTP verified for ${normalizedEmail}`);
    otpStore.delete(normalizedEmail);
    return true;
  }

  console.log(`OTP mismatch for ${normalizedEmail}`);
  return false;
}

export function getOTPData(email: string): OTPData | undefined {
  return otpStore.get(email.toLowerCase());
}