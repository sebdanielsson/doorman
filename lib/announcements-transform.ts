/**
 * Data Transformation Utilities for Announcements
 * Handles SOAP-to-UI data transformation, validation, and sanitization
 * Based on data-model.md specifications
 */

import type { TrmMessageLite } from '@/types/soap';
import type { AnnouncementItem, AnnouncementsList, PaginationInfo } from '@/types/announcements';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// DOMPurify needs a real DOM implementation. jsdom is the backend DOMPurify
// supports and tests against; happy-dom silently mis-sanitizes (it drops the
// leading text node and lets <script>/<iframe> through).
const purify = DOMPurify(new JSDOM('').window);

/**
 * Content type classification based on message analysis
 */
export interface ContentClassification {
  isTextOnly: boolean;
  isPdfOnly: boolean;
  isDocxOnly: boolean;
  hasImages: boolean;
  isHeader: boolean;
  textLength: number;
  hasPdfAttachment: boolean;
  hasDocxAttachment: boolean;
  hasDetailLink: boolean;
  mixedContent: boolean;
}

/**
 * Validation result for SOAP messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extract attachment information from content
 */
export function extractAttachments(content: string): Array<{
  type: 'pdf' | 'docx' | 'unknown';
  filename?: string;
  url?: string;
  displayText: string;
}> {
  const attachments: Array<{
    type: 'pdf' | 'docx' | 'unknown';
    filename?: string;
    url?: string;
    displayText: string;
  }> = [];

  // Look for PDF files - improved regex to capture filename better
  const pdfMatches = content.match(/\b[\w-]+\.pdf\b/gi);
  if (pdfMatches) {
    pdfMatches.forEach((match) => {
      const filename = match.trim();
      attachments.push({
        type: 'pdf',
        filename,
        displayText: filename,
      });
    });
  }

  // Look for DOCX/DOC files - improved regex to capture both extensions
  const docxMatches = content.match(/\b[\w-]+\.docx?\b/gi);
  if (docxMatches) {
    docxMatches.forEach((match) => {
      const filename = match.trim();
      attachments.push({
        type: 'docx',
        filename,
        displayText: filename,
      });
    });
  }

  return attachments;
}

/**
 * Transform SOAP TrmMessageLite to UI AnnouncementItem
 */
export function transformSoapToAnnouncement(message: TrmMessageLite): AnnouncementItem {
  validateSoapMessage(message);

  // Join text messages into single content string
  const rawContent = message.TextMessage.join(' ').trim();

  // Sanitize content for safe display
  const sanitizedContent = sanitizeContent(rawContent);

  // Extract attachment information
  const attachments = extractAttachments(rawContent);

  // Check for detail links
  const hasDetailLink =
    /click to view details|klicka för att visa detaljer|visa detaljer|läs mer/i.test(rawContent);

  return {
    id: message.MessageId,
    title: sanitizeTitle(message.MessageHeader),
    content: rawContent,
    createdDate: message.CreatedDate,
    hasImage: Boolean(message.HasImage),
    isHeader: Boolean(message.IsHeader),
    sanitizedContent,
    attachments: attachments.length > 0 ? attachments : undefined,
    hasDetailLink: hasDetailLink || undefined,
  };
}

/**
 * Transform array of SOAP messages to announcements list
 */
export function transformSoapToAnnouncementsList(
  messages: TrmMessageLite[],
  page: number = 1,
  pageSize: number = 10,
): AnnouncementsList {
  // Filter and transform messages
  const filteredMessages = filterValidMessages(messages);
  const announcements = filteredMessages.map(transformSoapToAnnouncement);

  // Calculate pagination
  const totalCount = announcements.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = announcements.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalCount,
    page,
    pageSize,
    hasNextPage: endIndex < totalCount,
    hasPreviousPage: page > 1,
    lastFetched: new Date(),
    error: undefined,
  };
}

/**
 * Create pagination info from total count and current page
 */
export function createPaginationInfo(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage: Math.max(1, currentPage),
    totalPages: Math.max(1, totalPages),
    totalItems,
    itemsPerPage,
  };
}

/**
 * Validate SOAP message structure
 */
export function validateSoapMessage(message: TrmMessageLite): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (typeof message.MessageId !== 'number' || message.MessageId <= 0) {
    errors.push('MessageId must be a positive number');
  }

  if (typeof message.ContentType !== 'number') {
    errors.push('ContentType must be a number');
  }

  if (!message.CreatedDate || typeof message.CreatedDate !== 'string') {
    errors.push('CreatedDate is required and must be a string');
  } else {
    // Validate date format
    const dateTest = new Date(message.CreatedDate);
    if (isNaN(dateTest.getTime())) {
      warnings.push('CreatedDate is not in a valid date format');
    }
  }

  if (!message.MessageHeader || typeof message.MessageHeader !== 'string') {
    warnings.push('MessageHeader should be a non-empty string');
  }

  if (!Array.isArray(message.TextMessage)) {
    errors.push('TextMessage must be an array');
  } else if (message.TextMessage.length === 0) {
    warnings.push('TextMessage array is empty');
  }

  if (typeof message.HasImage !== 'boolean') {
    warnings.push('HasImage should be a boolean');
  }

  if (typeof message.IsHeader !== 'boolean') {
    warnings.push('IsHeader should be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Classify message content type
 */
export function classifyContent(message: TrmMessageLite): ContentClassification {
  const textMessages = message.TextMessage || [];
  const joinedText = textMessages.join(' ').toLowerCase().trim();
  const originalText = textMessages.join(' ').trim();

  // Check for file extensions
  const hasPdf = /\b[\w-]+\.pdf\b/i.test(originalText);
  const hasDocx = /\b[\w-]+\.docx?\b/i.test(originalText);

  // Check for detail link patterns
  const hasDetailLink =
    /click to view details|klicka för att visa detaljer|visa detaljer|läs mer/i.test(originalText);

  // Check if ONLY file references (no other meaningful text)
  const fileOnlyPattern = /^[\s\w]*\.(pdf|docx?)\b[\s\w]*$/i;
  const isFileOnly = fileOnlyPattern.test(joinedText);

  // Calculate text length excluding file references
  const textWithoutFiles = originalText.replace(/\b[\w-]+\.(pdf|docx?)\b/gi, '').trim();
  const meaningfulTextLength = textWithoutFiles.length;

  // Determine if content has both text and attachments
  const hasMixedContent = (hasPdf || hasDocx || hasDetailLink) && meaningfulTextLength > 10;

  return {
    isTextOnly: meaningfulTextLength > 10 && !hasPdf && !hasDocx && !hasDetailLink,
    isPdfOnly: hasPdf && isFileOnly,
    isDocxOnly: hasDocx && isFileOnly,
    hasImages: Boolean(message.HasImage),
    isHeader: Boolean(message.IsHeader),
    textLength: meaningfulTextLength,
    hasPdfAttachment: hasPdf,
    hasDocxAttachment: hasDocx,
    hasDetailLink: hasDetailLink,
    mixedContent: hasMixedContent,
  };
}

/**
 * Filter messages to include only text-based announcements
 */
export function filterValidMessages(messages: TrmMessageLite[]): TrmMessageLite[] {
  return messages.filter((message) => {
    // Validate message structure
    const validation = validateSoapMessage(message);
    if (!validation.isValid) {
      console.warn(`Invalid message ${message.MessageId}:`, validation.errors);
      return false;
    }

    // Classify content
    const classification = classifyContent(message);

    // Exclude header messages (navigation elements)
    if (classification.isHeader) {
      return false;
    }

    // Exclude PDF/DOCX-only messages (no meaningful text content)
    if (classification.isPdfOnly || classification.isDocxOnly) {
      return false;
    }

    // Include messages with meaningful text content OR mixed content (text + attachments)
    return classification.textLength > 10 || classification.mixedContent;
  });
}

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // First, decode HTML entities that might have been encoded
  const decodedContent = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Then, normalize malformed HTML tags
  const normalizedContent = decodedContent
    // Fix malformed break tags: </br> should be <br>
    .replace(/<\/br>/gi, '<br>')
    // Fix self-closing break tags without slash: <br> to <br/>
    .replace(/<br(?![/>])/gi, '<br/>')
    // Normalize common HTML entities
    .replace(/&nbsp;/g, ' ')
    // Fix common malformed tags
    .replace(/<\/p>/gi, '</p>')
    .replace(/<p(?![/>])/gi, '<p>')
    // Clean up excessive whitespace around HTML tags
    .replace(/\s*<br\s*\/?>\s*/gi, '<br/>');

  const sanitized = purify.sanitize(normalizedContent, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  });

  // Post-process to add security attributes to links
  return sanitized.replace(
    /<a\s+href="([^"]*)"([^>]*)>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"$2>',
  );
}

/**
 * Sanitize and format title
 */
export function sanitizeTitle(title: string | undefined): string {
  if (!title || typeof title !== 'string') {
    return 'Announcement';
  }

  // Remove HTML tags and excessive whitespace
  const cleanTitle = purify.sanitize(title, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return cleanTitle.trim() || 'Announcement';
}

/**
 * Format date for display
 */
export function formatAnnouncementDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date not available';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Date not available';
  }
}

/**
 * Sort announcements by date (newest first)
 */
export function sortAnnouncementsByDate(
  announcements: AnnouncementItem[],
  order: 'asc' | 'desc' = 'desc',
): AnnouncementItem[] {
  return [...announcements].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();

    if (isNaN(dateA) || isNaN(dateB)) {
      return 0; // Keep original order if dates are invalid
    }

    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Extract preview text from announcement content
 */
export function extractPreviewText(content: string, maxLength: number = 150): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last space before the max length to avoid cutting words
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  return lastSpaceIndex > maxLength * 0.8
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

/**
 * Group announcements by date
 */
export function groupAnnouncementsByDate(
  announcements: AnnouncementItem[],
): Record<string, AnnouncementItem[]> {
  const groups: Record<string, AnnouncementItem[]> = {};

  announcements.forEach((announcement) => {
    try {
      const date = new Date(announcement.createdDate);
      if (!isNaN(date.getTime())) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(announcement);
      }
    } catch {
      // Skip announcements with invalid dates
    }
  });

  return groups;
}

/**
 * Utility functions export
 */
export const transformUtils = {
  transformSoapToAnnouncement,
  transformSoapToAnnouncementsList,
  createPaginationInfo,
  validateSoapMessage,
  classifyContent,
  filterValidMessages,
  sanitizeContent,
  sanitizeTitle,
  formatAnnouncementDate,
  sortAnnouncementsByDate,
  extractPreviewText,
  groupAnnouncementsByDate,
};
