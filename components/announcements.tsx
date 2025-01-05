"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// Custom hook for resize observer
function useResizeObserver(ref: React.RefObject<HTMLElement>) {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width)
            }
        })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [ref])

    return width
}

// Helper function to calculate visible pages
function getVisiblePages(currentPage: number, totalPages: number, maxVisible: number) {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1)
    const end = Math.min(start + maxVisible - 1, totalPages)

    if (end - start + 1 < maxVisible) {
        start = Math.max(end - maxVisible + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const announcementsList = [
    {
        id: "1",
        title: "Announcement 1",
        date: "2022-01-01",
    },
    {
        id: "2",
        title: "Announcement 2",
        date: "2022-01-02",
    },
    {
        id: "3",
        title: "Announcement 3",
        date: "2022-01-03",
    },
    {
        id: "4",
        title: "Announcement 4",
        date: "2022-01-04",
    },
    {
        id: "5",
        title: "Announcement 5",
        date: "2022-01-05",
    },
    {
        id: "6",
        title: "Announcement 6",
        date: "2022-01-06",
    },
    {
        id: "7",
        title: "Announcement 7",
        date: "2022-01-07",
    },
    {
        id: "8",
        title: "Announcement 8",
        date: "2022-01-08",
    },
    {
        id: "9",
        title: "Announcement 9",
        date: "2022-01-09",
    },
    {
        id: "10",
        title: "Announcement 10",
        date: "2022-01-10",
    },
    {
        id: "11",
        title: "Announcement 11",
        date: "2022-01-11",
    },
    {
        id: "12",
        title: "Announcement 12",
        date: "2022-01-12",
    },
    {
        id: "13",
        title: "Announcement 13",
        date: "2022-01-13",
    },
    {
        id: "14",
        title: "Announcement 14",
        date: "2022-01-14",
    },
    {
        id: "15",
        title: "Announcement 15",
        date: "2022-01-15",
    },
    {
        id: "16",
        title: "Announcement 16",
        date: "2022-01-16",
    },
    {
        id: "17",
        title: "Announcement 17",
        date: "2022-01-17",
    },
    {
        id: "18",
        title: "Announcement 18",
        date: "2022-01-18",
    },
    {
        id: "19",
        title: "Announcement 19",
        date: "2022-01-19",
    },
    {
        id: "20",
        title: "Announcement 20",
        date: "2022-01-20",
    },
    {
        id: "21",
        title: "Announcement 21",
        date: "2022-01-21",
    },
    {
        id: "22",
        title: "Announcement 22",
        date: "2022-01-22",
    },
    {
        id: "23",
        title: "Announcement 23",
        date: "2022-01-23",
    },
    {
        id: "24",
        title: "Announcement 24",
        date: "2022-01-24",
    },
    {
        id: "25",
        title: "Monthly Maintenance Schedule",
        date: "2022-01-25",
    },
    {
        id: "26",
        title: "Community Meeting Notice",
        date: "2022-01-26",
    },
    {
        id: "27",
        title: "New Recycling Guidelines",
        date: "2022-01-27",
    },
    {
        id: "28",
        title: "Parking Policy Update",
        date: "2022-01-28",
    },
    {
        id: "29",
        title: "Upcoming Renovations",
        date: "2022-01-29",
    },
]

export function Announcements() {
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = 5
    const containerRef = useRef<HTMLDivElement>(null)
    const containerWidth = useResizeObserver(containerRef)

    // Calculate the number of visible pages based on container width
    const maxVisible = Math.max(3, Math.floor((containerWidth - 200) / 40)) // 200px for prev/next, 40px per page link

    const visiblePages = getVisiblePages(currentPage, totalPages, maxVisible)
    const showStartEllipsis = visiblePages[0] > 2
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1

    // Calculate the current announcements based on current page
    const startIndex = (currentPage - 1) * totalPages
    const currentAnnouncements = announcementsList.slice(startIndex, startIndex + totalPages)

    return (
        <div className="flex flex-col gap-4">


            <Accordion type="single" collapsible className="w-full">
                {currentAnnouncements.map((announcement) => (
                    <AccordionItem key={announcement.id} value={announcement.id} className='hover:no-underline'>
                        <AccordionTrigger>
                            <div>
                                <h4 className="text-base font-semibold">
                                    {announcement.title}
                                </h4>
                                <p className="text-sm font-normal text-gray-500">{announcement.date}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p>Please don&apos;t take a dump in the sauna.</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div ref={containerRef}>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }}
                            />
                        </PaginationItem>
                        {visiblePages[0] > 1 && (
                            <PaginationItem>
                                <PaginationLink href="#" onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(1)
                                }}>
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
                                        e.preventDefault()
                                        setCurrentPage(page)
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
                                <PaginationLink href="#" onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(totalPages)
                                }}>
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
