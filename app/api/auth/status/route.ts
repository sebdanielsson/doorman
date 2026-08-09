import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('loginGuid')?.value;

    if (!authToken) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    // In a real implementation, you might want to validate the token
    // against the SOAP service or decode it to get user information
    // For now, we'll just check if the token exists.
    //
    // The token itself is never echoed back: it lives in an HttpOnly cookie
    // precisely so that client-side script cannot read it.
    return NextResponse.json({
      isAuthenticated: true,
      user: {},
    });
  } catch (error) {
    console.error('Auth status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
