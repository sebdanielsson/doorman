import { NextRequest, NextResponse } from 'next/server';
import { loginCredentialsSchema } from '@/lib/auth-validation';
import { extractSystemnameFromUrl, formatLoginRequest } from '@/lib/soap-client';
import { LoginCredentials } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = loginCredentialsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { serverUrl, username, password } = validation.data;

    // Extract systemname from URL
    const systemname = extractSystemnameFromUrl(serverUrl);
    if (!systemname) {
      return NextResponse.json(
        { error: 'Unable to extract systemname from server URL' },
        { status: 400 },
      );
    }

    // Prepare SOAP request
    const credentials: LoginCredentials = {
      serverUrl,
      username,
      password,
      timeout: 1200, // Match iOS timeout
    };

    const soapXml = formatLoginRequest(credentials, serverUrl);

    // Make SOAP request to the backend
    const soapResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://www.rco.se/Api/Mobile/Login',
      },
      body: soapXml,
    });

    if (!soapResponse.ok) {
      const errorText = await soapResponse.text();
      console.error('SOAP request failed:', soapResponse.status, errorText);
      return NextResponse.json(
        {
          error: 'SOAP request failed',
          status: soapResponse.status,
          details: errorText,
          debug:
            process.env.NODE_ENV === 'development'
              ? {
                  serverUrl,
                  soapRequest: soapXml,
                  responseStatus: soapResponse.status,
                  responseBody: errorText,
                }
              : undefined,
        },
        { status: 502 },
      );
    }

    const responseText = await soapResponse.text();

    // Parse the SOAP response to extract the login result
    // Handle both self-closing tags and empty elements
    const loginResultMatch = responseText.match(
      /<LoginResult[^>]*>([^<]*)<\/LoginResult>|<LoginResult[^>]*\/>/,
    );

    if (!loginResultMatch) {
      // Check for SOAP faults
      const faultMatch = responseText.match(
        /<soap:Fault>.*?<faultstring>(.*?)<\/faultstring>.*?<\/soap:Fault>/,
      );
      if (faultMatch) {
        return NextResponse.json(
          { error: 'Authentication failed', message: faultMatch[1] },
          { status: 401 },
        );
      }

      console.error('Unable to parse SOAP response:', responseText.substring(0, 500));
      return NextResponse.json(
        {
          error: 'Invalid SOAP response format',
          debug:
            process.env.NODE_ENV === 'development'
              ? {
                  serverUrl,
                  soapRequest: soapXml,
                  responseStatus: soapResponse.status,
                  responseBody: responseText,
                }
              : undefined,
        },
        { status: 502 },
      );
    }

    // For self-closing tags, the content will be undefined, which means login failed
    const loginResult = loginResultMatch[1];

    if (!loginResult || loginResult.trim() === '') {
      console.error('Authentication failed: Empty LoginResult');
      console.error('Request details:', { serverUrl, username, systemname });
      console.error('Response details:', { status: soapResponse.status, body: responseText });

      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'Invalid credentials or empty login result',
          debug:
            process.env.NODE_ENV === 'development'
              ? {
                  serverUrl,
                  username,
                  systemname,
                  responseStatus: soapResponse.status,
                  responseBody: responseText,
                  soapRequest: soapXml,
                }
              : undefined,
        },
        { status: 401 },
      );
    }

    // Set the authentication token as an HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      username,
      systemname,
    });

    response.cookies.set('loginGuid', loginResult, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    });

    // Also store the server URL for subsequent API calls
    response.cookies.set('soapEndpoint', serverUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
