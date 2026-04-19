import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { resource, params } = await req.json();
  const secret = process.env.METABASE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "No secret" }, { status: 500 });

  const token = jwt.sign({ resource, params, exp: Math.round(Date.now() / 1000) + 600 }, secret);
  const metabaseUrl = process.env.NEXT_PUBLIC_METABASE_URL ?? "http://localhost:3000";
  const type = resource.dashboard !== undefined ? "dashboard" : "question";
  const id = resource.dashboard ?? resource.question;

  return NextResponse.json({ url: `${metabaseUrl}/embed/${type}/${token}#bordered=false&titled=false` });
}