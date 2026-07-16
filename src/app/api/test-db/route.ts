import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const result: Record<string, unknown> = {};

  const dbUrl = process.env.DATABASE_URL;
  result.hasDatabaseUrl = !!dbUrl;
  result.urlLength = dbUrl?.length ?? 0;
  result.urlStartsWith = dbUrl?.substring(0, 30) ?? "N/A";

  if (!dbUrl) {
    return NextResponse.json({ ...result, error: "DATABASE_URL is not set" }, { status: 500 });
  }

  try {
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });

    const start = Date.now();
    const pgResult = await pool.query("SELECT 1 as ok");
    const elapsed = Date.now() - start;

    result.pgConnected = true;
    result.pgResult = pgResult.rows;
    result.elapsedMs = elapsed;

    await pool.end();
  } catch (err: any) {
    result.pgConnected = false;
    result.pgError = err.message;
    result.pgCode = err.code;
  }

  return NextResponse.json(result);
}
