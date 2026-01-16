'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { AttachmentDisplay } from '@/components/attachment-display';
import { DetailLink } from '@/components/detail-link';
import type {
  AnnouncementItem,
  AnnouncementsApiResponse,
  AttachmentInfo,
} from '@/types/announcements';
import { Button } from '@/components/ui/button';
import Link from 'next/dist/client/link';
import { File } from 'lucide-react';

// Custom hook for resize observer
function useResizeObserver(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return width;
}

// Helper function to calculate visible pages
function getVisiblePages(currentPage: number, totalPages: number, maxVisible: number) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  const end = Math.min(start + maxVisible - 1, totalPages);

  if (end - start + 1 < maxVisible) {
    start = Math.max(end - maxVisible + 1, 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Component to display header image in accordion trigger
function HeaderImage({ announcementId, title }: { announcementId: number; title: string }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cacheKey] = useState(() => Date.now() + Math.random());

  if (imageError) {
    return null;
  }

  return (
    <div className="mr-3 flex-shrink-0">
      {!imageLoaded && (
        <div className="h-12 w-12 animate-pulse rounded border bg-gray-200 dark:bg-gray-700" />
      )}
      {/* Use regular img tag instead of Next.js Image for more lenient validation */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/announcements/${announcementId}/header-image?t=${cacheKey}&force=1`}
        alt={`Header image for ${title}`}
        width={48}
        height={48}
        className={`h-12 w-12 rounded border object-cover ${imageLoaded ? 'block' : 'hidden'}`}
        onError={() => {
          console.log(`Header image failed to load for announcement ${announcementId}`);
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
    </div>
  );
}

// Component to detect and render PDF or image content appropriately
function PDFOrImageViewer({
  url,
  title,
  announcementId,
}: {
  url: string;
  title: string;
  announcementId: number;
}) {
  const [contentType, setContentType] = useState<'unknown' | 'image' | 'pdf'>('unknown');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Detect content type by making a HEAD request
    const detectContentType = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentTypeHeader = response.headers.get('content-type');

        if (contentTypeHeader?.includes('pdf')) {
          setContentType('pdf');
        } else if (contentTypeHeader?.startsWith('image/')) {
          setContentType('image');
        } else {
          // Fallback: try to load as image first
          setContentType('image');
        }
      } catch (error) {
        console.log(`Failed to detect content type for announcement ${announcementId}:`, error);
        // Default to trying image first
        setContentType('image');
      }
    };

    detectContentType();
  }, [url, announcementId]);

  // If we detected it's a PDF or image failed to load, show PDF viewer
  if (contentType === 'pdf' || imageError) {
    return (
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 border-b p-4">
          <File />
          <span className="font-medium">Bifogad fil</span>
          <Button asChild className="ml-auto">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              Öppna i ny flik
            </Link>
          </Button>
        </div>
        <div className="">
          <object
            data={url}
            type="application/pdf"
            className="h-96 w-full"
            title={`Attachment for ${title}`}
          >
            <div className="p-4 text-center">
              <p className="mb-2 text-gray-600">PDF kan inte visas i denna webbläsare.</p>
              <Button asChild className="ml-auto">
                <Link href={url} target="_blank" rel="noopener noreferrer">
                  Öppna PDF i ny flik
                </Link>
              </Button>
            </div>
          </object>
        </div>
      </div>
    );
  }

  // If we detected it's an image or haven't detected yet, try to show as image
  if (contentType === 'image' || contentType === 'unknown') {
    return (
      <Image
        src={url}
        alt={`Image for ${title}`}
        className="h-auto max-w-full rounded"
        width={600}
        height={400}
        onError={() => {
          console.log(
            `Image failed to load for announcement ${announcementId}, switching to PDF viewer`,
          );
          setImageError(true);
        }}
      />
    );
  }

  return null;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useResizeObserver(containerRef);

  // Fetch announcements from API
  const fetchAnnouncements = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/announcements?page=${page}&pageSize=${itemsPerPage}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view announcements');
          return;
        }
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }

      const data: AnnouncementsApiResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load announcements');
      }

      setAnnouncements(data.data.announcements);
      setTotalPages(data.data.pagination.totalPages);
      setTotalItems(data.data.pagination.totalItems);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while loading announcements',
      );
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements on component mount and when page changes
  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [currentPage]);

  // Calculate the number of visible pages based on container width
  const maxVisible = Math.max(3, Math.floor((containerWidth - 200) / 40)); // 200px for prev/next, 40px per page link

  const visiblePages = getVisiblePages(currentPage, totalPages, maxVisible);
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Accordion type="single" collapsible className="w-full">
          {Array.from({ length: itemsPerPage }).map((_, i) => {
            const titleWidths = ['w-60', 'w-48', 'w-72', 'w-56', 'w-64'];
            const subtitleWidths = ['w-40'];
            return (
              <AccordionItem key={i} value={`loading-${i}`} className="hover:no-underline">
                <AccordionTrigger>
                  <div>
                    <div className="mb-1">
                      <Skeleton className={`h-5 ${titleWidths[i % titleWidths.length]}`} />
                    </div>
                    <Skeleton className={`h-3 ${subtitleWidths[i % subtitleWidths.length]}`} />
                  </div>
                </AccordionTrigger>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Pagination skeleton (matches spacing of real pagination) */}
        <div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="mt-2 flex justify-center">
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchAnnouncements(currentPage)}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (announcements.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-gray-500">No announcements available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Accordion type="single" collapsible className="w-full">
        {announcements.map((announcement) => (
          <AccordionItem
            key={announcement.id}
            value={announcement.id.toString()}
            className="hover:no-underline"
          >
            <AccordionTrigger>
              <div className="flex w-full items-center">
                {announcement.hasImage && announcement.isHeader && (
                  <HeaderImage announcementId={announcement.id} title={announcement.title} />
                )}
                <div className="flex-1">
                  <h4 className="text-left text-base font-semibold">{announcement.title}</h4>
                  <p className="text-left text-sm font-normal text-gray-500">
                    {new Date(announcement.createdDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: announcement.sanitizedContent }}
              />

              {/* Display attachments if any */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <AttachmentDisplay
                  attachments={announcement.attachments}
                  onAttachmentClick={(attachment: AttachmentInfo) => {
                    // Handle attachment click - could open file, show message, etc.
                    console.log('Attachment clicked:', attachment);
                    // For now, just show an alert since we don't have direct file access
                    alert(
                      `Bifogad fil: ${attachment.filename || attachment.displayText}\n\nFilen är inte direkt tillgänglig för nedladdning från denna gränssnitt.`,
                    );
                  }}
                />
              )}

              {/* Display detail link if present */}
              {announcement.hasDetailLink && (
                <DetailLink
                  onDetailClick={() => {
                    // Handle detail link click
                    console.log('Detail link clicked for announcement:', announcement.id);
                    alert(
                      'Detaljvy är inte implementerad än. Kontakta administratören för mer information.',
                    );
                  }}
                  disabled={true} // Currently disabled since we don't have the detail view implemented
                />
              )}

              {announcement.hasImage && announcement.imageUrl && (
                <div className="mt-2">
                  <PDFOrImageViewer
                    url={announcement.imageUrl}
                    title={announcement.title}
                    announcementId={announcement.id}
                  />
                </div>
              )}

              {announcement.hasImage && !announcement.imageUrl && (
                <div className="mt-2 rounded bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  📎 Detta meddelande innehåller en bifogad fil som inte kunde laddas.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {totalPages > 1 && (
        <div ref={containerRef}>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {visiblePages[0] > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              {showStartEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {visiblePages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {showEndEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="mt-2 text-center text-sm text-gray-500">
            Showing {announcements.length} of {totalItems} announcements
          </p>
        </div>
      )}
    </div>
  );
}
