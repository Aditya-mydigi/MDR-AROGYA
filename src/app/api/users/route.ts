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
    const whereClause: any = {
  u_type: "army",
};

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
      first_name,
      middle_name,
      last_name,
      email,
      phone_num,
      password,
      dob,
      gender,
      blood_group,
      city,
      state,
      country,
      zip_code,
      emergency_contact,
      emergency_contact_name,
    } = body || {};

    const validationErrors: string[] = [];

if (!first_name) validationErrors.push("First name is required");
if (!last_name) validationErrors.push("Last name is required");
if (!email) validationErrors.push("Email is required");
if (!phone_num) validationErrors.push("Phone number is required");
if (!password) validationErrors.push("Password is required");

if (validationErrors.length > 0) {
  return NextResponse.json(
    {
      success: false,
      errors: validationErrors,
    },
    { status: 400 }
  );
}

    const response = await fetch(
      "https://dev-mdr-in.mydigirecords.com/v1/auth-mydig/api/army/in/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZWU5NGJiNS1kZGMwLTQzODAtYTNkYi0wN2ZmNDUwZTBlMjkiLCJzZXNzaW9uSWQiOiI2OWY2MWY3My1jZjhhLTRiY2QtYTQxZS03ZmZkOTkzM2VlMjAiLCJtZHJfaWQiOiJNRFIyNjAzOTc2MjgySSIsImlhdCI6MTc3MzE0MTgyNiwiZXhwIjoxNzczMTQ1NDI2fQ.zUPd8HZ0aaYe2Gje3vpMR5oSn2FmzD5IJDeV2JrnXP0",
        },
        body: JSON.stringify({
          first_name,
          middle_name: middle_name || "",
          last_name,
          password,
          email,
          phone_num,
          dob,
          gender,
          image_url: "",
          google_id: null,
          blood_group,
          city,
          state,
          country,
          zip_code,
          emergency_contact,
          emergency_contact_name,
          u_type: "army",
        }),
      }
    );

    const data = await response.json();

    console.log("REGISTER API STATUS:", response.status);
console.log("REGISTER API RESPONSE:", data);

    if (!response.ok) {
  let errors: string[] = [];

  if (data?.errors && typeof data.errors === "object") {
    errors = Object.values(data.errors);
  } else if (data?.message) {
    errors = [data.message];
  } else {
    errors = ["Failed to register user"];
  }

  return NextResponse.json(
    {
      success: false,
      errors,
    },
    { status: 400 }
  );
}

    //After registration set default daily_sv = 5
    try {
      await prismaIndia.users.update({
        where: { email: email.toLowerCase() },
        data: {
          daily_sv: 5,
        },
      });
    } catch (error) {
      console.warn("Could not update daily_sv:", error);
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);

    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
}
