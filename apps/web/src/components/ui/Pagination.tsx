'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-2 py-8">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`inline-flex h-9 items-center justify-center rounded-md border border-border/40 bg-background px-3 text-sm transition-colors hover:bg-muted ${
          currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Previous
      </Link>

      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/40 text-sm transition-colors ${
              currentPage === page
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted'
            }`}
          >
            {page}
          </Link>
        ))}
      </div>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`inline-flex h-9 items-center justify-center rounded-md border border-border/40 bg-background px-3 text-sm transition-colors hover:bg-muted ${
          currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        Next <ChevronRight className="ml-1 h-4 w-4" />
      </Link>
    </nav>
  );
}
