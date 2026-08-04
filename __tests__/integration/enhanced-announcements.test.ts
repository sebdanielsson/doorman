/**
 * Integration test for enhanced announcements with attachments and detail links
 */

import { describe, expect, it } from 'vitest';
import { transformSoapToAnnouncement } from '@/lib/announcements-transform';
import type { TrmMessageLite } from '@/types/soap';

describe('Enhanced Announcements Integration', () => {
  it('should transform message with PDF attachment', () => {
    const soapMessage: TrmMessageLite = {
      MessageId: 1,
      ContentType: 1,
      CreatedDate: '2025-01-25T10:30:00',
      MessageHeader: 'Policy Update with Attachment',
      RelatedMessageId: 0,
      TextMessage: [
        'Please review the new policy document.pdf',
        'Contact us if you have questions.',
      ],
      HasImage: false,
      IsHeader: false,
      RelatedContentType: 0,
    };

    const announcement = transformSoapToAnnouncement(soapMessage);

    expect(announcement.attachments).toBeDefined();
    expect(announcement.attachments).toHaveLength(1);
    expect(announcement.attachments![0].type).toBe('pdf');
    expect(announcement.attachments![0].filename).toBe('document.pdf');
    expect(announcement.hasDetailLink).toBeFalsy();
  });

  it('should transform message with detail link', () => {
    const soapMessage: TrmMessageLite = {
      MessageId: 2,
      ContentType: 1,
      CreatedDate: '2025-01-25T10:30:00',
      MessageHeader: 'Important Notice',
      RelatedMessageId: 0,
      TextMessage: ['New policy updates available.', 'Click to view details for more information.'],
      HasImage: false,
      IsHeader: false,
      RelatedContentType: 0,
    };

    const announcement = transformSoapToAnnouncement(soapMessage);

    expect(announcement.hasDetailLink).toBe(true);
    expect(announcement.attachments).toBeUndefined();
  });

  it('should transform message with HTML content and mixed attachments', () => {
    const soapMessage: TrmMessageLite = {
      MessageId: 3,
      ContentType: 1,
      CreatedDate: '2025-01-25T10:30:00',
      MessageHeader: 'HSB Communication Update',
      RelatedMessageId: 0,
      TextMessage: [
        'Gå in och uppdatera era kontaktuppgifter på mitthsb.hsb.se </br>',
        'Då vi blir mer och mer digital så är det viktigt att telefonnummer och mejladress stämmer i våra datasystem.</br>',
        'Se även policy.pdf för mer information.</br>',
        'mvh</br>Styrelsen gm fastighetsförvaltare Karin på HSB</br>',
      ],
      HasImage: false,
      IsHeader: false,
      RelatedContentType: 0,
    };

    const announcement = transformSoapToAnnouncement(soapMessage);

    // Should have HTML content normalized
    expect(announcement.sanitizedContent).toContain('<br>');
    expect(announcement.sanitizedContent).not.toContain('</br>');

    // Should detect PDF attachment
    expect(announcement.attachments).toBeDefined();
    expect(announcement.attachments).toHaveLength(1);
    expect(announcement.attachments![0].filename).toBe('policy.pdf');

    // Should preserve text content
    expect(announcement.content).toContain('mitthsb.hsb.se');
    expect(announcement.content).toContain('Styrelsen gm fastighetsförvaltare Karin på HSB');
  });

  it('should handle announcement with both attachments and detail link', () => {
    const soapMessage: TrmMessageLite = {
      MessageId: 4,
      ContentType: 1,
      CreatedDate: '2025-01-25T10:30:00',
      MessageHeader: 'Complex Announcement',
      RelatedMessageId: 0,
      TextMessage: [
        'Please download form.pdf and guidelines.docx.',
        'Click to view details for additional information.',
      ],
      HasImage: false,
      IsHeader: false,
      RelatedContentType: 0,
    };

    const announcement = transformSoapToAnnouncement(soapMessage);

    expect(announcement.attachments).toHaveLength(2);
    expect(announcement.attachments![0].type).toBe('pdf');
    expect(announcement.attachments![1].type).toBe('docx');
    expect(announcement.hasDetailLink).toBe(true);
  });
});
