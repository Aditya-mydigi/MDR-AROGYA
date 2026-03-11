import { NextResponse } from "next/server";
import { prismaIndia } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user id" },
        { status: 400 }
      );
    }

    const user = await prismaIndia.users.findUnique({
      where: { id },
      select: { daily_sv: true, monthly_ocr: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      daily_sv: user.daily_sv ?? 0,
      monthly_ocr: user.monthly_ocr ?? 0,
    });
  } catch (error) {
    console.error("❌ Error fetching scan limits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scan limits" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, daily_sv, monthly_ocr } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user id" },
        { status: 400 }
      );
    }

    const parsedDaily = daily_sv !== undefined ? Number(daily_sv) : undefined;
    const parsedMonthly =
      monthly_ocr !== undefined ? Number(monthly_ocr) : undefined;

    const updated = await prismaIndia.users.update({
      where: { id },
      data: {
        daily_sv: parsedDaily,
        monthly_ocr: parsedMonthly,
      },
      select: { daily_sv: true, monthly_ocr: true },
    });

    return NextResponse.json({
      success: true,
      daily_sv: updated.daily_sv ?? 0,
      monthly_ocr: updated.monthly_ocr ?? 0,
    });
  } catch (error) {
    console.error("❌ Error updating scan limits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update scan limits" },
      { status: 500 }
    );
  }
}

