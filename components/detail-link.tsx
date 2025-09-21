/**
 * Detail Link Component
 * Handles "Click to view details" scenarios in announcements
 */

import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DetailLinkProps {
  onDetailClick?: () => void;
  disabled?: boolean;
}

export function DetailLink({ onDetailClick, disabled = true }: DetailLinkProps) {
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Mer information tillgänglig
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Detta meddelande innehåller ytterligare detaljer som kan visas separat.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onDetailClick}
              disabled={disabled}
              className="h-8 border-blue-300 bg-white px-3 text-blue-700 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              {disabled ? 'Ej tillgänglig' : 'Visa detaljer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
