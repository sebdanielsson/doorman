/**
 * API Route: /api/announcements/[id]/header-image
 * Fetches header images for announcements from SOAP service
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { soapClient } from '@/lib/soap-client';
import { validateSoapEndpoint } from '@/lib/soap-endpoint';

/**
 * Helper function to process SOAP image response
 */
function processImageResponse(
  soapResponse: {
    success: boolean;
    data?: { GetTerminalMessageImageResult?: string };
    fault?: { faultString?: string };
  },
  messageId: number,
): NextResponse {
  const imageData = soapResponse.data?.GetTerminalMessageImageResult;

  if (!imageData || typeof imageData !== 'string' || imageData.trim() === '') {
    console.log(`No header image data found for announcement ${messageId}`);
    return NextResponse.json(
      {
        success: false,
        error: 'No header image data found',
      },
      { status: 404 },
    );
  }

  try {
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Determine content type from base64 signature
    let contentType = 'application/octet-stream'; // default

    // Check for images (header images should typically be images, not PDFs)
    if (imageData.startsWith('iVBORw0KGgo')) {
      contentType = 'image/png';
    } else if (imageData.startsWith('/9j/')) {
      contentType = 'image/jpeg';
    } else if (imageData.startsWith('R0lGODlh')) {
      contentType = 'image/gif';
    } else if (imageData.startsWith('UklGR')) {
      contentType = 'image/webp';
    } else {
      console.log(
        `Unknown image format for header image ${messageId}, base64 starts with: ${imageData.substring(0, 10)}`,
      );
      // Default to jpeg for unknown formats
      contentType = 'image/jpeg';
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error processing header image data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process header image data',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/announcements/[id]/header-image
 * Fetches header image for a specific announcement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // 1. Authentication check
    const cookieStore = await cookies();
    const loginGuid = cookieStore.get('loginGuid')?.value;

    if (!loginGuid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      );
    }

    // Re-validate the stored endpoint before using it as a request target, so
    // a tampered or stale cookie cannot redirect these calls.
    let soapEndpoint: string;
    try {
      soapEndpoint = validateSoapEndpoint(cookieStore.get('soapEndpoint')?.value ?? '');
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'SOAP endpoint not found. Please log in again.',
        },
        { status: 401 },
      );
    }

    // 2. Parse message ID
    const resolvedParams = await params;
    const messageId = parseInt(resolvedParams.id, 10);
    if (isNaN(messageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message ID',
        },
        { status: 400 },
      );
    }

    // 3. Fetch header image from SOAP service (isHeaderImage = true)
    const soapResponse = await soapClient.getTerminalMessageImage(
      soapEndpoint,
      loginGuid,
      messageId,
      true, // isHeaderImage = true for header images
    );

    if (!soapResponse.success) {
      console.log(
        `SOAP request failed for header image ${messageId}:`,
        soapResponse.fault?.faultString,
      );

      const faultString = soapResponse.fault?.faultString || 'Failed to fetch header image';
      const faultCode = soapResponse.fault?.faultCode;

      // If it's specifically "no image available", return 404
      if (
        faultCode === 'NoImage' ||
        faultString.includes('no image') ||
        faultString.includes('No image')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'No header image available for this announcement',
          },
          { status: 404 },
        );
      }

      // For other errors, determine status code
      const statusCode = faultString.includes('Authentication') ? 401 : 500;

      return NextResponse.json(
        {
          success: false,
          error: faultString,
        },
        { status: statusCode },
      );
    } else {
      // Process the successful response
      return processImageResponse(soapResponse, messageId);
    }
  } catch (error) {
    console.error('Header image API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
