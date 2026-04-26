import Link from "next/link";
import { Search, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="w-full bg-brand-bg text-brand-dark py-4">
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-yellow-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <span className="sr-only">Logo</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight">Cook</span>
            <span className="font-bold text-base tracking-tight">Simple</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase">
          <Link href="/" className="border-b-2 border-brand-orange pb-1 hover:text-brand-orange transition-colors">
            Home
          </Link>
          <Link href="/recipes" className="text-gray-500 hover:text-brand-orange transition-colors">
            Recipes
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-brand-orange transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-gray-500 hover:text-brand-orange transition-colors">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-5">
          <button className="text-brand-dark hover:text-brand-orange transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-brand-dark hover:text-brand-orange transition-colors">
            <User className="w-5 h-5" />
          </button>
          <Link 
            href="#subscribe" 
            className="hidden sm:inline-flex bg-brand-dark text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  );
}
