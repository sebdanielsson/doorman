import { NextRequest, NextResponse } from 'next/server'
import { formatLogoutRequest } from '@/lib/soap-client'

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Get the server URL from request body
    const body = await request.json()
    const { serverUrl } = body
    
    if (!serverUrl) {
      return NextResponse.json(
        { error: 'Server URL is required for logout' },
        { status: 400 }
      )
    }

    // Prepare SOAP logout request
    const soapXml = formatLogoutRequest({
      loginguid: authToken
    })

    // Make SOAP request to the backend
    const soapResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.rco.se/Api/Mobile/Logout'
      },
      body: soapXml
    })

    if (!soapResponse.ok) {
      console.warn('SOAP logout request failed, but proceeding with local logout', soapResponse.status)
    }

    // Clear the authentication cookie regardless of SOAP response
    const response = NextResponse.json({ success: true })
    
    response.cookies.delete('auth_token')

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    
    // Even if there's an error, clear the local session
    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth_token')
    
    return response
  }
}
