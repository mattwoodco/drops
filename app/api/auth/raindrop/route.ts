import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.RAINDROP_CLIENT_ID;
const CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REDIRECT_URI = `${BASE_URL}/api/auth/raindrop/callback`;

export async function GET() {
  const authUrl = `https://raindrop.io/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=all`;
  return NextResponse.json({ authUrl });
}

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const requestBody = {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const tokenResponse = await fetch(
      'https://raindrop.io/oauth/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.errorMessage || 'Failed to obtain access token'
      );
    }

    return NextResponse.json(tokenData);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to obtain access token',
      },
      { status: 500 }
    );
  }
}
