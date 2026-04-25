import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { Suspense } from "react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold tracking-tight">RecipeBlog</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <Suspense fallback={<div className="h-9 w-full max-w-sm rounded-full bg-muted animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary text-muted-foreground">
            Home
          </Link>
          <Link href="/categories" className="transition-colors hover:text-primary text-muted-foreground">
            Categories
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary text-muted-foreground">
            About
          </Link>
          <div className="pl-4 border-l border-border/40">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
