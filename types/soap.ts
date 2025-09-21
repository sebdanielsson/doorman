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
  LogoutResult: string;
}

export interface SoapClient {
  login: (credentials: LoginRequest) => Promise<SoapResponse<LoginResponse>>;
  logout: (loginguid: string) => Promise<SoapResponse<LogoutResponse>>;
  isHealthy: () => Promise<boolean>;
}

export interface SoapEnvelope<T = unknown> {
  'soap:Envelope': {
    'soap:Body': T;
  };
}

export interface SoapHeaders {
  'Content-Type': 'text/xml; charset=utf-8';
  SOAPAction: string;
}

// SOAP operation configurations
export const SOAP_OPERATIONS = {
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
