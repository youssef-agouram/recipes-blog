import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container max-w-screen-2xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} RecipeBlog. Minimal design for food lovers.
            </p>
          </div>
          
          <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
