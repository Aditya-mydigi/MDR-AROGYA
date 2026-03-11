import { NextResponse } from "next/server";
import { prismaIndia, prismaUSA } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, region } = body;

    if (!email || !region) {
      return NextResponse.json(
        { message: "email and region are required" },
        { status: 400 }
      );
    }

    // Normalize region to lowercase for comparison
    const normalizedRegion = region.toLowerCase();

    if (normalizedRegion !== "india" && normalizedRegion !== "usa") {
      return NextResponse.json(
        { message: "Invalid region" },
        { status: 400 }
      );
    }

    console.log("Password reset requested for region:", normalizedRegion);

    // Generate a secure random password
    const newPassword = crypto.randomBytes(8).toString("base64");
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(newPassword, salt, 1000, 64, "sha512")
      .toString("hex");

    const combinedPassword = `${salt}:${hashedPassword}`;

    // Handle each region separately to avoid TypeScript union type issues
    let user;

    if (normalizedRegion === "india") {
      user = await prismaIndia.users.findFirst({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      await prismaIndia.users.update({
        where: { email },
        data: {
          password: combinedPassword,
          updated_at: new Date(),
        },
      });
    } else {
      user = await prismaUSA.users.findFirst({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      await prismaUSA.users.update({
        where: { email },
        data: {
          password: combinedPassword,
          updated_at: new Date(),
        },
      });
    }

    // Send password reset email
    await sendPasswordResetEmail(email, newPassword);

    // ✅ SECURITY: Only log that reset was successful, NEVER log the password
    console.log(`✅ Password reset successful for user: ${email}`);

    return NextResponse.json(
      { message: "Password reset successfully. Email sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}