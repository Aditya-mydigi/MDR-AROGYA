import { NextResponse } from "next/server";
import { prismaIndia, prismaUSA } from "@/lib/prisma";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status"); // Active, Inactive, Expired
    const region = searchParams.get("region")?.toLowerCase(); // india, usa

    const bloodGroupsParam = searchParams.get("blood_groups");
    const bloodGroups =
      bloodGroupsParam && bloodGroupsParam.length > 0
        ? bloodGroupsParam.split(",").map((bg) => bg.trim())
        : [];

    console.log(
      `📄 Fetching users (page=${page}, limit=${limit}, search="${search}", status="${status}", region="${region}")`
    );

    // Dynamic filters for both DBs
    const whereClause: any = {};

    let searchOR: any[] = [];
    if (search) {
      const parts = search.split(/\s+/).filter(Boolean);
      searchOR = [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone_num: { contains: search, mode: "insensitive" } },
        { mdr_id: { contains: search, mode: "insensitive" } },
        { blood_group: { contains: search, mode: "insensitive" } },
      ];

      // If multiple words, try matching them across name fields
      if (parts.length >= 2) {
        const first = parts[0];
        const last = parts.slice(1).join(" ");

        searchOR.push({
          AND: [
            { first_name: { contains: first, mode: "insensitive" } },
            { last_name: { contains: last, mode: "insensitive" } },
          ],
        });

        searchOR.push({
          AND: [
            { first_name: { contains: last, mode: "insensitive" } },
            { last_name: { contains: first, mode: "insensitive" } },
          ],
        });
      }

      whereClause.OR = searchOR;
    }

    if (bloodGroups.length > 0) {
      whereClause.blood_group = { in: bloodGroups };
    }

    // Status Filtering Logic
    const now = new Date();
    if (status === "Inactive") {
      whereClause.user_plan_active = false;
    } else if (status === "Expired") {
      whereClause.user_plan_active = true;
      whereClause.expiry_date = { lt: now };
    } else if (status === "Active") {
      whereClause.user_plan_active = true;
      whereClause.OR = [
        { expiry_date: { gte: now } },
        { expiry_date: null },
      ];
      // Note: Re-integrating search OR clause if it exists is tricky with Prisma's top-level OR.
      // If search exists, we need to be careful not to overwrite the OR.
      // Prisma doesn't support implicit AND between top-level ORs easily without AND: [].
      if (search) {
        // We need to restructure to use AND for the status+search combination
        whereClause.AND = [
          { OR: searchOR },
          {
            OR: [
              { expiry_date: { gte: now } },
              { expiry_date: null },
            ],
          },
        ];
        delete whereClause.OR; // Remove the top-level OR we added earlier
      }
    }

    // Select fields to return
    const selectFieldsIndia = {
      id: true,
      mdr_id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_num: true,
      gender: true,
      dob: true,
      created_at: true,
      user_plan_active: true,
      blood_group: true,
      address: true,
      plan_id: true,
      payment_date: true,
      expiry_date: true,
      country: true,
      daily_sv: true,
      monthly_ocr: true,
      credit: true,
    };

    const selectFieldsUSA = {
      id: true,
      mdr_id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_num: true,
      gender: true,
      dob: true,
      created_at: true,
      user_plan_active: true,
      blood_group: true,
      address: true,
      plan_id: true,
      payment_date: true,
      expiry_date: true,
      country: true,
    };

    let indiaUsers: any[] = [];
    let usaUsers: any[] = [];
    let indiaCount = 0;
    let usaCount = 0;

    // Execute queries based on region filter
    const promises = [];

    if (!region || region === "total" || region === "india") {
      promises.push(
        prismaIndia.users
          .findMany({
            skip,
            take: limit,
            where: whereClause,
            select: selectFieldsIndia,
            orderBy: { created_at: "desc" },
          })
          .then((res) => (indiaUsers = res))
          .catch((e) => console.error("India fetch failed", e)),
        prismaIndia.users
          .count({ where: whereClause })
          .then((c) => (indiaCount = c))
          .catch(() => 0)
      );
    }

    if (!region || region === "total" || region === "usa") {
      promises.push(
        prismaUSA.users
          .findMany({
            skip,
            take: limit,
            where: whereClause,
            select: selectFieldsUSA,
            orderBy: { created_at: "desc" },
          })
          .then((res) => (usaUsers = res))
          .catch((e) => console.error("USA fetch failed", e)),
        prismaUSA.users
          .count({ where: whereClause })
          .then((c) => (usaCount = c))
          .catch(() => 0)
      );
    }

    await Promise.all(promises);

    const allUsers = [
      ...indiaUsers.map((u) => ({ ...u, region: "India" })),
      ...usaUsers.map((u) => ({ ...u, region: "USA" })),
    ];

    const total = indiaCount + usaCount;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      total,
      totalPages,
      currentPage: page,
      users: allUsers,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      region,
      first_name,
      last_name,
      email,
      phone_num,
      gender,
      country,
      blood_group,
      plan_id,
      user_plan_active,
      payment_date,
      expiry_date,
    } = body || {};

    if (!email || !region) {
      return NextResponse.json(
        { success: false, error: "Email and region are required" },
        { status: 400 }
      );
    }

    const normalizedRegion = String(region).toLowerCase();
    const id = generateUUID();

    if (normalizedRegion === "india") {
      const normalizedGender =
        typeof gender === "string" && gender
          ? (gender as "Male" | "Female" | "Other" | "male" | "female" | "other")
          : ("Other" as const);

      const created = await prismaIndia.users.create({
        data: {
          id,
          first_name: first_name || null,
          last_name: last_name || null,
          email: email.toLowerCase(),
          phone_num: phone_num || null,
          gender: normalizedGender,
          country: country || "India",
          blood_group: blood_group || null,
          plan_id: plan_id || null,
          user_plan_active: Boolean(user_plan_active),
          payment_date: payment_date ? new Date(payment_date) : null,
          expiry_date: expiry_date ? new Date(expiry_date) : null,
        },
      });

      return NextResponse.json({ success: true, user: created });
    }

    if (normalizedRegion === "usa") {
      const created = await prismaUSA.users.create({
        data: {
          id,
          first_name: first_name || null,
          last_name: last_name || null,
          email: email.toLowerCase(),
          phone_num: phone_num || null,
          gender: gender || null,
          country: country || "USA",
          blood_group: blood_group || null,
          plan_id: plan_id || null,
          user_plan_active: Boolean(user_plan_active),
          payment_date: payment_date ? new Date(payment_date) : null,
          expiry_date: expiry_date ? new Date(expiry_date) : null,
        },
      });

      return NextResponse.json({ success: true, user: created });
    }

    return NextResponse.json(
      { success: false, error: "Invalid region" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
