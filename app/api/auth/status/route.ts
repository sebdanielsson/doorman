import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value
    
    if (!authToken) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      })
    }

    // In a real implementation, you might want to validate the token
    // against the SOAP service or decode it to get user information
    // For now, we'll just check if the token exists
    
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        // We don't have user details stored in the token
        // In a production app, you might want to store these in the session
        // or make another API call to get user profile
        token: authToken
      }
    })

  } catch (error) {
    console.error('Auth status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
