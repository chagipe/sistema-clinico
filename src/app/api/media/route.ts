import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consultationId = searchParams.get("consultationId");

    if (!consultationId) {
      return NextResponse.json(
        { error: "consultationId is required" },
        { status: 400 }
      );
    }

    const media = await prisma.media.findMany({
      where: { consultationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        label: true,
        createdAt: true,
        data: true,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Error fetching media" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultationId, filename, mimeType, data, label } = body;

    if (!consultationId || !filename || !mimeType || !data) {
      return NextResponse.json(
        { error: "consultationId, filename, mimeType, and data are required" },
        { status: 400 }
      );
    }

    const media = await prisma.media.create({
      data: {
        consultationId,
        filename,
        mimeType,
        data,
        label: label || null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Error creating media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 }
      );
    }

    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Error deleting media" },
      { status: 500 }
    );
  }
}
