import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const descriptionMatches = await prisma.cie10Code.findMany({
      where: {
        description: { contains: q, mode: "insensitive" },
      },
      take: 20,
      orderBy: { code: "asc" },
    });

    const codeMatches = await prisma.cie10Code.findMany({
      where: {
        code: { contains: q, mode: "insensitive" },
      },
      take: 20,
      orderBy: { code: "asc" },
    });

    const seen = new Set<string>();
    const merged: typeof descriptionMatches = [];
    for (const item of [...descriptionMatches, ...codeMatches]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }

    return NextResponse.json(merged.slice(0, 20));
  } catch (error) {
    console.error("Error fetching CIE-10 codes:", error);
    return NextResponse.json(
      { error: "Error fetching CIE-10 codes" },
      { status: 500 }
    );
  }
}
