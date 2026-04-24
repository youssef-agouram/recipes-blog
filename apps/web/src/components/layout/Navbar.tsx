import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold tracking-tight">RecipeBlog</span>
        </Link>
        
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
        </nav>
      </div>
    </header>
  );
}
