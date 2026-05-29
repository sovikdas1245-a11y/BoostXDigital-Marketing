import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PORTFOLIO' },
  { id: 'docs', label: 'DOCS' },
  { id: 'contact', label: 'CONTACT' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section highlights
      const scrollPosition = window.scrollY + 150;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 font-mono ${
          scrolled
            ? 'bg-[#0B0B0B]/85 backdrop-blur-md py-4 border-b border-white/5 shadow-lg'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* LOGO AND BRAND */}
          <button
            onClick={() => handleScrollTo('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="relative">
              <span className="text-xl md:text-2xl font-black font-display tracking-wider text-white">
                VIBE<span className="text-[#FF0000]">STUDIO</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF0000] transition-all duration-300 group-hover:w-full" />
            </div>
          </button>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex gap-10 items-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`relative py-1 text-sm font-semibold tracking-wider transition-colors duration-200 cursor-pointer ${
                  activeSection === item.id ? 'text-[#FF0000]' : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#FF0000] transition-all duration-300 ${
                    activeSection === item.id ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                />
              </button>
            ))}
            <button
              onClick={() => handleScrollTo('contact')}
              className="px-4 py-2 border border-[#FF0000] text-sm text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300 font-black flex items-center gap-1 group rounded-none cursor-pointer"
            >
              HIRE ME
              <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </nav>

          {/* MOBILE BURGER TRIGGER */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/90 hover:text-[#FF0000] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN OVERLAY MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed inset-0 w-full h-full bg-[#0B0B0B] z-45 flex flex-col justify-center px-8 md:px-16"
          >
            {/* Massive typographic list */}
            <div className="flex flex-col gap-6 mt-16">
              <span className="text-[#FF0000]/10 font-bold font-display text-7xl absolute top-8 left-8 select-none">
                NAVIGATION
              </span>
              {NAV_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleScrollTo(item.id)}
                  className="text-left font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white hover:text-[#FF0000] transition-colors focus:outline-none flex items-center justify-between group cursor-pointer"
                >
                  <span>{item.label}</span>
                  <div className="w-8 h-[2px] bg-white group-hover:bg-[#FF0000] group-hover:w-16 transition-all duration-300" />
                </motion.button>
              ))}
            </div>

            {/* Social channels / email at footer of mobile nav */}
            <div className="mt-16 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-start gap-4 font-mono text-gray-400 text-xs text-left">
              <div>
                <p className="text-white font-semibold mb-1">EMAIL INQUIRY</p>
                <a
                  href="mailto:sovikdas1245@gmail.com"
                  className="hover:text-red-500 transition-colors"
                >
                  sovikdas1245@gmail.com
                </a>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">CONNECT</p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-red-500 transition-colors">BEHANCE</a>
                  <a href="#" className="hover:text-red-500 transition-colors">DRIBBBLE</a>
                  <a href="#" className="hover:text-red-500 transition-colors">INSTAGRAM</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
