import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const codes = await prisma.cie10Code.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { code: "asc" },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Error fetching CIE-10 codes:", error);
    return NextResponse.json(
      { error: "Error fetching CIE-10 codes" },
      { status: 500 }
    );
  }
}
