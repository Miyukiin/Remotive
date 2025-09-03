import { NextResponse } from "next/server";

// Check if our pusher is working
export function GET() {

  return NextResponse.json({
    ok: true,
    keyPresent: Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY),
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });
}