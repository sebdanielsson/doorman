import { NextRequest, NextResponse } from 'next/server';
import { escapeXml } from '@/lib/soap-client';
import { validateSoapEndpoint } from '@/lib/soap-endpoint';

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('loginGuid')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // The endpoint comes from the `soapEndpoint` cookie set at login, never
    // from the request body: this request carries the session token, and a
    // body-supplied URL would let a forged request deliver it anywhere.
    const storedEndpoint = request.cookies.get('soapEndpoint')?.value;

    let serverUrl: string;
    try {
      serverUrl = validateSoapEndpoint(storedEndpoint ?? '');
    } catch {
      // No usable endpoint to notify — still clear the local session below.
      return clearSession();
    }

    // Prepare SOAP logout request
    const soapXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Logout xmlns="http://www.rco.se/Api/Mobile">
      <loginguid>${escapeXml(authToken)}</loginguid>
    </Logout>
  </soap:Body>
</soap:Envelope>`;

    // Make SOAP request to the backend
    const soapResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://www.rco.se/Api/Mobile/Logout',
      },
      body: soapXml,
    });

    if (!soapResponse.ok) {
      console.warn(
        'SOAP logout request failed, but proceeding with local logout',
        soapResponse.status,
      );
    }

    // Clear the authentication cookie regardless of SOAP response
    return clearSession();
  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, clear the local session
    return clearSession();
  }
}

function clearSession(): NextResponse {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('loginGuid');
  response.cookies.delete('soapEndpoint');

  return response;
}
