/**
 * API Route: /api/announcements/[id]/image
 * Fetches images for announcements from SOAP service
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { soapClient } from '@/lib/soap-client';

/**
 * Helper function to process SOAP image response
 */
function processImageResponse(soapResponse: {
  success: boolean;
  data?: { GetTerminalMessageImageResult?: string };
  fault?: { faultString?: string };
}): NextResponse {
  const imageData = soapResponse.data?.GetTerminalMessageImageResult;

  if (!imageData || typeof imageData !== 'string' || imageData.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        error: 'No image data found',
      },
      { status: 404 },
    );
  }

  try {
    const trimmed = imageData.trim();
    const imageBuffer = Buffer.from(trimmed, 'base64');

    // Determine content type from base64 signature or buffer content
    let contentType = 'application/octet-stream'; // default

    // Check for PDF (base64 may have whitespace/newlines so use trimmed)
    if (trimmed.startsWith('JVBERi0') || imageBuffer.toString('ascii', 0, 4) === '%PDF') {
      contentType = 'application/pdf';
    }
    // Check for images
    else if (imageData.startsWith('iVBORw0KGgo')) {
      contentType = 'image/png';
    } else if (imageData.startsWith('/9j/')) {
      contentType = 'image/jpeg';
    } else if (imageData.startsWith('R0lGODlh')) {
      contentType = 'image/gif';
    }
    // Check for Word documents
    else if (imageData.startsWith('UEsDB') || imageBuffer.toString('ascii', 0, 2) === 'PK') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    console.debug('processImageResponse - detected', { contentType, length: imageBuffer.length });

    return new NextResponse(imageBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        // Add content disposition for PDFs and documents
        ...(contentType.includes('pdf') && {
          'Content-Disposition': 'inline; filename="announcement.pdf"',
        }),
        ...(contentType.includes('word') && {
          'Content-Disposition': 'attachment; filename="announcement.docx"',
        }),
      },
    });
  } catch (error) {
    console.error('Error processing image data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process image data',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/announcements/[id]/image
 * Fetches image for a specific announcement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // 1. Authentication check
    const cookieStore = await cookies();
    const loginGuid = cookieStore.get('loginGuid')?.value;
    const soapEndpoint = cookieStore.get('soapEndpoint')?.value;

    if (!loginGuid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      );
    }

    if (!soapEndpoint) {
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

    // 3. Check if this is a header image request - iOS uses regular images by default
    const { searchParams } = new URL(request.url);
    const requestedHeaderImage = searchParams.get('header') === 'true';

    // For announcements marked as having images, iOS app uses regular images (isHeaderImage = false)
    let isHeaderImage = requestedHeaderImage;
    if (!requestedHeaderImage) {
      // Match iOS behavior: default to regular image (isHeaderImage = false)
      isHeaderImage = false;
    }

    // 4. Fetch image from SOAP service
    const soapResponse = await soapClient.getTerminalMessageImage(
      soapEndpoint,
      loginGuid,
      messageId,
      isHeaderImage,
    );

    if (!soapResponse.success) {
      // If regular image failed and we didn't explicitly request header, try header image as fallback
      if (!isHeaderImage && !requestedHeaderImage) {
        console.log(`DEBUG - Regular image failed, trying header image for message ${messageId}`);
        const headerImageResponse = await soapClient.getTerminalMessageImage(
          soapEndpoint,
          loginGuid,
          messageId,
          true,
        );

        if (headerImageResponse.success) {
          // Process the header image response
          const imageData = headerImageResponse.data?.GetTerminalMessageImageResult;
          if (imageData && imageData.trim() !== '') {
            // Use the successful header image response instead
            return processImageResponse(headerImageResponse);
          }
        }
      }

      // Both attempts failed, return error
      const faultString = soapResponse.fault?.faultString || 'Failed to fetch image';
      const faultCode = soapResponse.fault?.faultCode;

      // If it's specifically "no image available", return 404
      if (faultCode === 'NoImage') {
        return NextResponse.json(
          {
            success: false,
            error: 'No image available for this announcement',
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
      // Process the successful response directly
      return processImageResponse(soapResponse);
    }
  } catch (error) {
    console.error('Image API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
