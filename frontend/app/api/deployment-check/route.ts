import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    reviewerLoginEnabled: true,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
