import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const where: any = {};
    if (patientId) where.patientId = patientId;

    const packages = await prisma.treatmentPackage.findMany({
      where,
      include: {
        sessions: { orderBy: { sessionNumber: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: "Error fetching packages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, treatmentName, bodyZone, totalSessions, packagePrice, sessionPrice } = body;

    if (!patientId || !treatmentName) {
      return NextResponse.json({ error: "patientId and treatmentName are required" }, { status: 400 });
    }

    const pkg = await prisma.treatmentPackage.create({
      data: {
        patientId,
        treatmentName,
        bodyZone: bodyZone || null,
        totalSessions: totalSessions || 10,
        packagePrice: packagePrice || null,
        sessionPrice: sessionPrice || null,
      },
      include: {
        sessions: true,
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json({ error: "Error creating package" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.treatmentPackage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: "Error deleting package" }, { status: 500 });
  }
}
