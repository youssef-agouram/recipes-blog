'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="relative group w-full max-w-sm"
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes..."
        className="h-9 w-full rounded-full border border-border/40 bg-muted/50 pl-10 pr-4 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </form>
  );
}
