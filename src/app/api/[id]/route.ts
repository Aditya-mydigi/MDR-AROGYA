import { NextResponse } from "next/server";
import { prismaIndia, prismaUSA } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { region, active } = body;

        const isIndia = region?.toLowerCase() === "india";
        const prisma = isIndia ? prismaIndia : prismaUSA;

        let updateData: any = {
            user_plan_active: active,
        };

        if (active) {
            const today = new Date();
            // Calculate expiry date (default to 1 year = 365 days if plan not found)
            let validityDays = 365;

            try {
                const plan = await (prisma as any).plans.findUnique({
                    where: { plan_id: "1" },
                });
                if (plan && plan.validity_in_days) {
                    validityDays = plan.validity_in_days;
                }
            } catch (err) {
                console.error("Plan lookup failed, using default 365 days", err);
            }

            const expiryDate = new Date(today);
            expiryDate.setDate(expiryDate.getDate() + validityDays);

            updateData = {
                ...updateData,
                plan_id: "1",
                payment_date: today,
                expiry_date: expiryDate,
            };

            if (isIndia) {
                updateData.credit = 999;
            }
        } else {
            updateData = {
                ...updateData,
                plan_id: null,
                payment_date: null,
                expiry_date: null,
            };

            if (isIndia) {
                updateData.credit = 5;
            }
        }

        const updatedUser = await (prisma as any).users.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: `User subscription ${active ? "activated" : "deactivated"}`,
            user: updatedUser,
        });
    } catch (error: any) {
        console.error("❌ Subscription update error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update subscription" },
            { status: 500 }
        );
    }
}
