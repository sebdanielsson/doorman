/**
 * SOAP Client Types for VisionMobile API Integration
 * Based on contracts/soap-auth.md specifications
 */

export interface SoapResponse<T = unknown> {
  success: boolean;
  data?: T;
  fault?: SoapFault;
  rawResponse: string;
}

export interface SoapFault {
  faultCode: string;
  faultString: string;
  detail?: string;
}

export interface LoginRequest {
  systemname: string;
  username: string;
  Password: string; // Capital P as per SOAP spec
  timeout: number;
}

export interface LoginResponse {
  LoginResult: string; // The loginguid token
}

export interface LogoutRequest {
  loginguid: string;
}

export interface LogoutResponse {
  LogoutResult: boolean;
}

// News/Announcements Types
export interface TrmMessageLite {
  MessageId: number; // Unique identifier
  ContentType: number; // Determines message type/format
  CreatedDate: string; // ISO date string from SOAP (dateTime)
  MessageHeader: string; // Title/subject of the announcement
  RelatedMessageId: number; // Reference to parent/related message
  TextMessage: string[]; // Array of text content lines
  HasImage: boolean; // Indicates if image attachment exists
  IsHeader: boolean; // Indicates if this is a header message
  RelatedContentType: number; // Content type of related message
}

export interface GetAllTerminalMessageLiteRequest {
  loginguid: string;
}

export interface GetAllTerminalMessageLiteResponse {
  GetAllTerminalMessageLiteResult: TrmMessageLite[];
}

export interface GetOneTerminalMessageLiteResponse {
  GetOneTerminalMessageLiteResult: TrmMessageLite | null;
}

export interface GetTerminalMessageImageRequest {
  loginguid: string;
  messageId: number;
  isHeaderImage: boolean;
}

export interface GetTerminalMessageImageResponse {
  GetTerminalMessageImageResult: string; // Base64 encoded image
}

export interface SoapClient {
  login: (credentials: LoginRequest) => Promise<SoapResponse<LoginResponse>>;
  logout: (loginguid: string) => Promise<SoapResponse<LogoutResponse>>;
  getAllTerminalMessageLite: (
    loginguid: string,
  ) => Promise<SoapResponse<GetAllTerminalMessageLiteResponse>>;
  getTerminalMessageImage: (
    loginguid: string,
    messageId: number,
    isHeaderImage?: boolean,
  ) => Promise<SoapResponse<GetTerminalMessageImageResponse>>;
  isHealthy: () => Promise<boolean>;
}

export interface SoapEnvelope<T = unknown> {
  'soap:Envelope': {
    'soap:Body': T;
  };
}

export interface SoapHeaders extends Record<string, string> {
  'Content-Type': 'text/xml; charset=utf-8';
  SOAPAction: string;
}

// SOAP operation configurations
/**
 * GetTerminalMessageImage request
 */
export interface GetTerminalMessageImageRequest {
  loginguid: string;
  messageId: number;
  isHeaderImage: boolean;
}

/**
 * GetTerminalMessageImage response
 */
export interface GetTerminalMessageImageResponse {
  GetTerminalMessageImageResult: string; // Base64 encoded image
}

/**
 * SOAP Headers configuration for different operations
 */
export const SOAP_HEADERS = {
  GET_ALL_TERMINAL_MESSAGE_LITE: {
    action: 'http://www.rco.se/Api/Mobile/GetAllTerminalMessageLite',
    namespace: 'http://www.rco.se/Api/Mobile/',
  },
  GET_TERMINAL_MESSAGE_IMAGE: {
    action: 'http://www.rco.se/Api/Mobile/GetTerminalMessageImage',
    namespace: 'http://www.rco.se/Api/Mobile/',
  },
  LOGIN: {
    action: 'http://www.rco.se/Api/Mobile/Login',
    namespace: 'http://www.rco.se/Api/Mobile/',
  },
  LOGOUT: {
    action: 'http://www.rco.se/Api/Mobile/Logout',
    namespace: 'http://www.rco.se/Api/Mobile/',
  },
} as const;

export const SOAP_ENDPOINT = 'https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx';

// Booking Types
export interface BookUserBooking {
  BookIndex: number; // Unique booking identifier
  BookDate: string; // Date of the booking
  BookTime: string; // Time of the booking
  BookPass: string; // Booking pass information (time slot name)
  BookMachineGroupName: string; // Name of the machine group
  BookMachineGroup: string; // Machine group identifier
  BookMachineGroupType: string; // Type of machine group
  BookUnit: string; // Unit identifier
  BookUnitName: string; // Unit name
  CanDelete: boolean; // Whether the booking can be deleted
}

export interface GetBookUserBookingCountResponse {
  GetBookUserBookingCountResult: string; // Count as string
}

export interface GetBookUserBookingsResponse {
  GetBookUserBookingsResult: BookUserBooking[];
}
