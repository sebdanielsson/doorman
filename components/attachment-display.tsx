/**
 * Attachment Display Component
 * Shows PDF, DOCX and other file attachments in announcements
 */

import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AttachmentInfo } from '@/types/announcements';

interface AttachmentDisplayProps {
  attachments: AttachmentInfo[];
  onAttachmentClick?: (attachment: AttachmentInfo) => void;
}

export function AttachmentDisplay({ attachments, onAttachmentClick }: AttachmentDisplayProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAttachmentBadgeVariant = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'destructive' as const;
      case 'docx':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Bilagor ({attachments.length})
      </h4>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex-shrink-0">{getAttachmentIcon(attachment.type)}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {attachment.filename || attachment.displayText}
                </p>
                <Badge variant={getAttachmentBadgeVariant(attachment.type)} className="text-xs">
                  {attachment.type.toUpperCase()}
                </Badge>
              </div>
              {attachment.displayText !== attachment.filename && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {attachment.displayText}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              {attachment.url ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAttachmentClick?.(attachment)}
                  className="h-8 px-2"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Ladda ner
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAttachmentClick?.(attachment)}
                  className="h-8 px-2"
                  disabled
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Ej tillgänglig
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
