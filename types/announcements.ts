/**
 * Announcements UI Types for Real News/Announcements Display
 * Based on data-model.md specifications
 */

export interface AnnouncementItem {
  id: number; // MessageId as number
  title: string; // MessageHeader, sanitized
  content: string; // Joined TextMessage array as single string
  createdDate: string; // CreatedDate as ISO string
  hasImage: boolean; // HasImage flag
  imageUrl?: string; // Lazy-loaded image URL if hasImage=true
  isHeader: boolean; // IsHeader flag
  sanitizedContent: string; // DOMPurify cleaned version of content
  attachments?: AttachmentInfo[]; // PDF/DOCX attachments detected in content
  hasDetailLink?: boolean; // Contains "Click to view details" or similar
}

export interface AttachmentInfo {
  type: 'pdf' | 'docx' | 'unknown';
  filename?: string; // Extracted filename if available
  url?: string; // URL if extractable
  displayText: string; // Text shown to user
}

export interface AnnouncementsList {
  items: AnnouncementItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  lastFetched: Date;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AnnouncementsApiResponse {
  success: boolean;
  data?: {
    announcements: AnnouncementItem[];
    pagination: PaginationInfo;
  };
  error?: string;
}

export interface AnnouncementsState {
  items: AnnouncementItem[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  lastFetched: Date | null;
}

export interface AnnouncementsFilters {
  excludePdfDocxOnly: boolean;
  sortByDate: 'asc' | 'desc';
  showRelatedMessages: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiry: Date;
  key: string;
}

export type AnnouncementsCacheEntry = CacheEntry<AnnouncementsList>;
