/**
 * API Route: /api/announcements
 * Fetches and transforms announcements from SOAP service
 * Based on contracts/api-routes.md specifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { soapClient } from '@/lib/soap-client';
import { sanitizeContent } from '@/lib/announcements-transform';
import type { AnnouncementsApiResponse, AnnouncementItem } from '@/types/announcements';
import type { TrmMessageLite } from '@/types/soap';

/**
 * GET /api/announcements
 * Fetches announcements from SOAP service with pagination and filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
        } as AnnouncementsApiResponse,
        { status: 401 },
      );
    }

    if (!soapEndpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'SOAP endpoint not found. Please log in again.',
        } as AnnouncementsApiResponse,
        { status: 401 },
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        } as AnnouncementsApiResponse,
        { status: 400 },
      );
    }

    // 3. Fetch from SOAP service
    const soapResponse = await soapClient.getAllTerminalMessageLite(loginGuid, soapEndpoint);

    if (!soapResponse.success) {
      const errorMessage = soapResponse.fault?.faultString || 'Service unavailable';
      const statusCode = soapResponse.fault?.faultCode === 'soap:Client' ? 401 : 502;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        } as AnnouncementsApiResponse,
        { status: statusCode },
      );
    }

    // 4. Transform and filter SOAP data
    const rawMessages = soapResponse.data?.GetAllTerminalMessageLiteResult || [];
    const filteredMessages = filterTextOnlyMessages(rawMessages);
    const transformedAnnouncements = filteredMessages.map(transformSoapMessage);

    // 5. Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAnnouncements = transformedAnnouncements.slice(startIndex, endIndex);

    // 6. Build response
    const response: AnnouncementsApiResponse = {
      success: true,
      data: {
        announcements: paginatedAnnouncements,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(transformedAnnouncements.length / limit),
          totalItems: transformedAnnouncements.length,
          itemsPerPage: limit,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Announcements API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as AnnouncementsApiResponse,
      { status: 500 },
    );
  }
}

/**
 * Filter messages to keep only relevant announcements
 * Based on ContentType analysis and message structure
 */
function filterTextOnlyMessages(messages: TrmMessageLite[]): TrmMessageLite[] {
  return messages.filter((message) => {
    // Exclude messages that have no header
    if (!message.MessageHeader || message.MessageHeader.trim() === '') {
      return false;
    }

    // Check if message has actual content
    const hasTextContent =
      message.TextMessage &&
      message.TextMessage.length > 0 &&
      message.TextMessage.some((text) => text.trim().length > 0);

    // Check if message has images
    const hasImage = Boolean(message.HasImage);

    // Include messages that have either:
    // 1. Text content, OR
    // 2. Images, OR
    // 3. A meaningful header (for functional announcements like "Felanmälan", "Kontakta Styrelsen/HSB")
    const hasMeaningfulHeader = message.MessageHeader && message.MessageHeader.trim().length > 0;
    const shouldInclude = hasTextContent || hasImage || hasMeaningfulHeader;

    return shouldInclude;
  });
}

/**
 * Transform SOAP message to announcement format with sanitization
 */
function transformSoapMessage(message: TrmMessageLite): AnnouncementItem {
  // Join text messages into single content string, handle empty arrays
  const rawContent =
    message.TextMessage && message.TextMessage.length > 0
      ? message.TextMessage.join(' ').trim()
      : '';

  // Determine content to display based on what's available
  let contentToDisplay: string;

  if (rawContent && rawContent.length > 0) {
    // Message has actual text content - use it
    contentToDisplay = rawContent;
  } else if (message.HasImage) {
    // Message has an image but no text - provide helpful fallback text
    contentToDisplay =
      'Detta meddelande innehåller en bild. Om bilden inte visas, kontakta administratören.';
  } else {
    // No text content and no image - use the header as content for functional announcements
    // This handles cases like "Felanmälan", "Kontakta Styrelsen/HSB" etc.
    contentToDisplay = `Klicka för att komma åt: ${message.MessageHeader}`;
  }

  // Use the proper sanitization function with HTML entity decoding
  const sanitizedContent = sanitizeContent(contentToDisplay);

  return {
    id: message.MessageId,
    title: message.MessageHeader || 'Announcement',
    content: contentToDisplay,
    createdDate: message.CreatedDate,
    hasImage: message.HasImage,
    isHeader: message.IsHeader,
    sanitizedContent,
    // Add image URL if the message has an image
    ...(message.HasImage && {
      imageUrl: `/api/announcements/${message.MessageId}/image`,
    }),
  };
}

/**
 * Only allow GET requests
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    {
      status: 405,
      headers: { Allow: 'GET' },
    },
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    {
      status: 405,
      headers: { Allow: 'GET' },
    },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    {
      status: 405,
      headers: { Allow: 'GET' },
    },
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    {
      status: 405,
      headers: { Allow: 'GET' },
    },
  );
}
