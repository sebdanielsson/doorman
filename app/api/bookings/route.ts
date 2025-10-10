/**
 * API Route: /api/bookings
 * Fetches user bookings from SOAP service
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { soapClient } from '@/lib/soap-client';
import type { BookUserBooking } from '@/types/soap';

export interface BookingItem {
  id: number;
  date: string;
  time: string;
  timeSlotName: string;
  machineGroupName: string;
  canDelete: boolean;
}

export interface BookingsApiResponse {
  success: boolean;
  data?: {
    bookings: BookingItem[];
  };
  error?: string;
}

/**
 * GET /api/bookings
 * Fetches user bookings from SOAP service
 */
export async function GET(): Promise<NextResponse> {
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
        } as BookingsApiResponse,
        { status: 401 },
      );
    }

    if (!soapEndpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'SOAP endpoint not found. Please log in again.',
        } as BookingsApiResponse,
        { status: 401 },
      );
    }

    // 2. Fetch bookings from SOAP service
    // Start with bookindex 0 to get all bookings
    const soapResponse = await soapClient.getBookUserBookings(loginGuid, 0, soapEndpoint);

    if (!soapResponse.success) {
      const errorMessage = soapResponse.fault?.faultString || 'Service unavailable';
      const statusCode = soapResponse.fault?.faultCode === 'soap:Client' ? 401 : 502;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        } as BookingsApiResponse,
        { status: statusCode },
      );
    }

    // 3. Transform SOAP data to API response format
    const rawBookings = soapResponse.data?.GetBookUserBookingsResult || [];
    const transformedBookings = rawBookings.map(transformBooking);

    // 4. Build response
    const response: BookingsApiResponse = {
      success: true,
      data: {
        bookings: transformedBookings,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Bookings API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as BookingsApiResponse,
      { status: 500 },
    );
  }
}

/**
 * Transform SOAP booking to API format
 */
function transformBooking(booking: BookUserBooking): BookingItem {
  return {
    id: booking.BookIndex,
    date: booking.BookDate,
    time: booking.BookTime,
    timeSlotName: booking.BookPass,
    machineGroupName: booking.BookMachineGroupName,
    canDelete: booking.CanDelete,
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
