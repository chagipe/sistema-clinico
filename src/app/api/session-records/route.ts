import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, sessionNumber, treatedZone, sessionDate, sessionTime, notes } = body;

    if (!packageId || !sessionNumber || !sessionDate) {
      return NextResponse.json({ error: "packageId, sessionNumber, and sessionDate are required" }, { status: 400 });
    }

    const record = await prisma.sessionRecord.create({
      data: {
        packageId,
        sessionNumber,
        treatedZone: treatedZone || null,
        sessionDate: new Date(sessionDate),
        sessionTime: sessionTime || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating session record:", error);
    return NextResponse.json({ error: "Error creating session record" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("packageId");

    if (!packageId) {
      return NextResponse.json({ error: "packageId is required" }, { status: 400 });
    }

    const records = await prisma.sessionRecord.findMany({
      where: { packageId },
      orderBy: { sessionNumber: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching session records:", error);
    return NextResponse.json({ error: "Error fetching session records" }, { status: 500 });
  }
}
