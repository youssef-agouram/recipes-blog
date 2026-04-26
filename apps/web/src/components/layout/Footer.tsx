import Link from "next/link";
import { PlaySquare, Users, Image, PlayCircle } from "lucide-react"; // replaced brand icons with available lucide icons

export function Footer() {
  return (
    <footer className="bg-brand-dark py-8 text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-orange to-yellow-400"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-tight text-white">Cook</span>
              <span className="font-bold text-sm tracking-tight text-white">Simple</span>
            </div>
          </Link>
          
          {/* Nav Links */}
          <nav className="flex gap-8 text-[10px] font-bold tracking-widest uppercase text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/recipes" className="hover:text-white transition-colors">Recipes</Link>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-white transition-colors"><PlaySquare className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Users className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Image className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><PlayCircle className="w-4 h-4" /></a>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} Cook Simple. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
