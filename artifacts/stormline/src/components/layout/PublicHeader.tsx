import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Menu, X } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [loc] = useLocation();

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [loc]);

  const navItems = [
    { label: 'About', href: '/#about', isHash: true },
    { label: 'How It Works', href: '/#how-to', isHash: true },
    { label: 'Compare', href: '/#compare', isHash: true },
    { label: 'Calendar', href: '/calendar', isHash: false },
    { label: 'Architecture', href: '/#architecture', isHash: true }
  ];

  const renderNav = (mobile = false) => (
    <>
      {navItems.map((item) =>
        item.isHash ? (
          <a
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-white"
            onClick={() => mobile && setIsOpen(false)}
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-white ${loc === item.href ? 'text-white' : ''}`}
            onClick={() => mobile && setIsOpen(false)}
          >
            {item.label}
          </Link>
        )
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#222] bg-[#050505]/95 text-white backdrop-blur-md">
      <div className="flex justify-between items-center p-4 md:px-12 md:py-6 max-w-[1600px] mx-auto w-full">
        <Logo theme="dark" />
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex gap-8 text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
            {renderNav(false)}
          </div>
          <div className="w-px h-4 bg-[#333]" />
          <Link href="/app" className="btn btn-dark">Open App <ArrowRight size={14}/></Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-[#a1a1aa] hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark border-b border-[#222] p-6 flex flex-col gap-6 shadow-2xl">
          <nav className="flex flex-col gap-6 text-sm font-mono uppercase tracking-widest text-[#a1a1aa]">
            {renderNav(true)}
          </nav>
          <div className="pt-6 border-t border-[#222]">
            <Link href="/app" className="btn btn-dark w-full justify-center">Open App <ArrowRight size={14}/></Link>
          </div>
        </div>
      )}
    </header>
  );
}
