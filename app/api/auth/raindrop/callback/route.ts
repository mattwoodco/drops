import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
// const REDIRECT_URI = `${BASE_URL}/api/auth/raindrop/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/raindrop-auth?error=no_code`);
  }

  try {
    console.log('Received code:', code);
    console.log(
      'Calling token exchange endpoint:',
      `${BASE_URL}/api/auth/raindrop`
    );
    const tokenResponse = await fetch(`${BASE_URL}/api/auth/raindrop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token data received:', JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error || 'Failed to obtain access token');
    }

    const response = NextResponse.redirect(`${BASE_URL}/`);

    response.cookies.set('raindrop_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect(
      `${BASE_URL}/raindrop-auth?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Unknown error'
      )}`
    );
  }
}
