/**
 * Test: HTML Content Normalization and PDF Detection in Announcements Transform
 * Tests the sanitizeContent function for proper HTML handling and attachment detection
 */

import { describe, expect, it } from 'vitest';
import {
  sanitizeContent,
  extractAttachments,
  classifyContent,
} from '@/lib/announcements-transform';
import type { TrmMessageLite } from '@/types/soap';

describe('HTML Content Normalization', () => {
  describe('sanitizeContent', () => {
    it('should handle HTML-encoded content', () => {
      const input =
        'Gå in och uppdatera era kontaktuppgifter på mitthsb.hsb.se &lt;/br&gt; Då vi blir mer och mer digital så är det viktigt att telefonnummer och mejladress stämmer i våra datasystem.&lt;/br&gt;mvh&lt;/br&gt;Styrelsen gm fastighetsförvaltare Karin på HSB&lt;/br&gt;';
      const result = sanitizeContent(input);

      // Should decode HTML entities first
      expect(result).not.toContain('&lt;');
      expect(result).not.toContain('&gt;');

      // Should contain proper <br> tags
      expect(result).toContain('<br');

      // Should preserve the text content
      expect(result).toContain('Gå in och uppdatera era kontaktuppgifter');
      expect(result).toContain('mitthsb.hsb.se');
      expect(result).toContain('Styrelsen gm fastighetsförvaltare Karin på HSB');
    });

    it('should normalize malformed </br> tags to <br>', () => {
      const input =
        'Gå in och uppdatera era kontaktuppgifter på mitthsb.hsb.se </br> Då vi blir mer och mer digital så är det viktigt att telefonnummer och mejladress stämmer i våra datasystem.</br>mvh</br>Styrelsen gm fastighetsförvaltare Karin på HSB</br>';
      const result = sanitizeContent(input);

      // Should not contain malformed </br> tags
      expect(result).not.toContain('</br>');

      // Should contain proper <br> tags
      expect(result).toContain('<br');

      // Should preserve the text content
      expect(result).toContain('Gå in och uppdatera era kontaktuppgifter');
      expect(result).toContain('mitthsb.hsb.se');
      expect(result).toContain('Styrelsen gm fastighetsförvaltare Karin på HSB');
    });

    it('should handle mixed HTML content with breaks', () => {
      const input = 'First line</br>Second line<br>Third line<br/>Fourth line';
      const result = sanitizeContent(input);

      expect(result).not.toContain('</br>');
      expect(result).toContain('First line<br');
      expect(result).toContain('Second line<br');
      expect(result).toContain('Third line<br');
      expect(result).toContain('Fourth line');
    });

    it('should preserve safe HTML tags', () => {
      const input =
        'This is <strong>bold</strong> and <em>italic</em> text</br>With a <a href="https://example.com">link</a>';
      const result = sanitizeContent(input);

      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should remove dangerous HTML tags', () => {
      const input =
        'Safe content</br><script>alert("dangerous")</script><iframe src="bad.html"></iframe>';
      const result = sanitizeContent(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<iframe>');
      expect(result).toContain('Safe content<br');
    });

    it('should handle empty and invalid input', () => {
      expect(sanitizeContent('')).toBe('');
      expect(sanitizeContent(null as any)).toBe('');
      expect(sanitizeContent(undefined as any)).toBe('');
    });

    it('should normalize excessive whitespace around breaks', () => {
      const input = 'Text   </br>   More text   <br>   Final text';
      const result = sanitizeContent(input);

      // Should clean up whitespace around breaks
      expect(result).toMatch(/Text<br[/>]*>More text<br[/>]*>Final text/);
    });

    it('should preserve paragraphs', () => {
      const input =
        '<p>First paragraph</br>Line break in paragraph</p></br><p>Second paragraph</p>';
      const result = sanitizeContent(input);

      expect(result).toContain('<p>First paragraph<br');
      expect(result).toContain('<p>Second paragraph</p>');
    });
  });

  describe('extractAttachments', () => {
    it('should detect PDF attachments in content', () => {
      const content = 'Please check the document policy.pdf for details. Also see guidelines.pdf.';
      const attachments = extractAttachments(content);

      expect(attachments).toHaveLength(2);
      expect(attachments[0].type).toBe('pdf');
      expect(attachments[0].filename).toBe('policy.pdf');
      expect(attachments[1].filename).toBe('guidelines.pdf');
    });

    it('should detect DOCX attachments in content', () => {
      const content = 'Download the form application.docx and budget.doc';
      const attachments = extractAttachments(content);

      expect(attachments).toHaveLength(2);
      expect(attachments[0].type).toBe('docx');
      expect(attachments[0].filename).toBe('application.docx');
      expect(attachments[1].filename).toBe('budget.doc');
    });

    it('should handle mixed content with both text and attachments', () => {
      const content =
        'Please review the new policy document.pdf and fill out form.docx before the deadline.';
      const attachments = extractAttachments(content);

      expect(attachments).toHaveLength(2);
      expect(attachments[0].type).toBe('pdf');
      expect(attachments[1].type).toBe('docx');
    });
  });

  describe('classifyContent', () => {
    it('should detect mixed content with PDF attachments', () => {
      const message: TrmMessageLite = {
        MessageId: 1,
        ContentType: 1,
        CreatedDate: '2025-01-25T10:30:00',
        MessageHeader: 'Policy Update',
        RelatedMessageId: 0,
        TextMessage: [
          'Please review the new policy document.pdf',
          'Contact us if you have questions.',
        ],
        HasImage: false,
        IsHeader: false,
        RelatedContentType: 0,
      };

      const classification = classifyContent(message);

      expect(classification.mixedContent).toBe(true);
      expect(classification.hasPdfAttachment).toBe(true);
      expect(classification.textLength).toBeGreaterThan(10);
    });

    it('should detect detail link patterns', () => {
      const message: TrmMessageLite = {
        MessageId: 1,
        ContentType: 1,
        CreatedDate: '2025-01-25T10:30:00',
        MessageHeader: 'Important Notice',
        RelatedMessageId: 0,
        TextMessage: ['New policy updates available.', 'Click to view details...'],
        HasImage: false,
        IsHeader: false,
        RelatedContentType: 0,
      };

      const classification = classifyContent(message);

      expect(classification.hasDetailLink).toBe(true);
      expect(classification.mixedContent).toBe(true);
    });
  });
});
