import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TornDivider from './components/TornDivider';
import ProjectShowcase from './components/ProjectShowcase';
import GoogleDocsCollaborator from './components/GoogleDocsCollaborator';
import ContactForm from './components/ContactForm';
import CoolAvatar from './components/CoolAvatar';
import { motion } from 'motion/react';
import {
  MousePointer,
  PenTool,
  Type,
  Crop,
  Pipette,
  Search,
  Hand,
  ArrowDown,
  Sparkles,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  FileText,
} from 'lucide-react';

// Design toolbar tools list
const TOOLBAR_TOOLS = [
  { icon: MousePointer, id: 'select', name: 'Selection Tool (V)' },
  { icon: PenTool, id: 'pen', name: 'Vector Pen Tool (P)' },
  { icon: Type, id: 'type', name: 'Text Frame (T)' },
  { icon: Crop, id: 'crop', name: 'Artboard Slice (C)' },
  { icon: Pipette, id: 'eyedropper', name: 'Color Pipette (I)' },
  { icon: Hand, id: 'hand', name: 'Hand Navigation (H)' },
  { icon: Search, id: 'zoom', name: 'Interactive Zoom (Z)' },
];

function oklabToRgbValues(l: number, a_: number, b_: number, a: number): string {
  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855414 * b_;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const rL = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bL = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  const f = (x: number) => {
    if (isNaN(x)) return 0;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const val = absX <= 0.0031308 ? absX * 12.92 : 1.055 * Math.pow(absX, 1 / 2.4) - 0.055;
    return sign * val;
  };
  
  const r = Math.max(0, Math.min(255, Math.round(f(rL) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gL) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(bL) * 255)));
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function oklchToRgb(lStr: string, cStr: string, hStr: string, alphaStr?: string): string {
  let l = parseFloat(lStr);
  if (lStr.endsWith('%')) l = parseFloat(lStr) / 100;
  
  let c = parseFloat(cStr);
  if (cStr.endsWith('%')) c = parseFloat(cStr) / 100;
  
  let h = parseFloat(hStr);
  if (hStr.endsWith('rad')) {
    h = parseFloat(hStr) * (180 / Math.PI);
  } else if (hStr.endsWith('turn')) {
    h = parseFloat(hStr) * 360;
  } else if (hStr.endsWith('deg')) {
    h = parseFloat(hStr);
  }
  
  let a = 1;
  if (alphaStr) {
    if (alphaStr.endsWith('%')) {
      a = parseFloat(alphaStr) / 100;
    } else {
      a = parseFloat(alphaStr);
    }
  }

  if (c === 0 || isNaN(c)) {
    const val = Math.max(0, Math.min(255, Math.round(l * 255)));
    return `rgba(${val}, ${val}, ${val}, ${a})`;
  }
  
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  
  return oklabToRgbValues(l, a_, b_, a);
}

function oklabToRgb(lStr: string, aStr: string, bStr: string, alphaStr?: string): string {
  let l = parseFloat(lStr);
  if (lStr.endsWith('%')) l = parseFloat(lStr) / 100;
  
  let a_ = parseFloat(aStr);
  if (aStr.endsWith('%')) a_ = parseFloat(aStr) / 100;
  
  let b_ = parseFloat(bStr);
  if (bStr.endsWith('%')) b_ = parseFloat(bStr) / 100;
  
  let a = 1;
  if (alphaStr) {
    if (alphaStr.endsWith('%')) {
      a = parseFloat(alphaStr) / 100;
    } else {
      a = parseFloat(alphaStr);
    }
  }
  
  return oklabToRgbValues(l, a_, b_, a);
}

function sanitizeColorString(str: string): string {
  if (typeof str !== 'string') return str;
  
  let result = str;

  // Patterns for matching oklch/oklab
  const oklchPattern = /oklch\(\s*([\d.+-]+%?)\s+([\d.+-]+%?)\s+([\d.+-]+(?:deg|rad|turn|%)?)(?:\s*\/\s*([\d.+-]+%?))?\s*\)/gi;
  const oklchCommaPattern = /oklch\(\s*([\d.+-]+%?),\s*([\d.+-]+%?),\s*([\d.+-]+(?:deg|rad|turn|%)?)(?:\s*,\s*([\d.+-]+%?))?\s*\)/gi;

  const oklabPattern = /oklab\(\s*([\d.+-]+%?)\s+([\d.+-]+%?)\s+([\d.+-]+%?)(?:\s*\/\s*([\d.+-]+%?))?\s*\)/gi;
  const oklabCommaPattern = /oklab\(\s*([\d.+-]+%?),\s*([\d.+-]+%?),\s*([\d.+-]+%?)(?:\s*,\s*([\d.+-]+%?))?\s*\)/gi;

  result = result.replace(oklchPattern, (match, l, c, h, a) => oklchToRgb(l, c, h, a));
  result = result.replace(oklchCommaPattern, (match, l, c, h, a) => oklchToRgb(l, c, h, a));
  result = result.replace(oklabPattern, (match, l, a_, b_, a) => oklabToRgb(l, a_, b_, a));
  result = result.replace(oklabCommaPattern, (match, l, a_, b_, a) => oklabToRgb(l, a_, b_, a));

  if (result.includes('oklch') || result.includes('oklab')) {
    result = result.replace(/oklch\([^)]+\)/gi, 'rgba(136, 136, 136, 1)');
    result = result.replace(/oklab\([^)]+\)/gi, 'rgba(136, 136, 136, 1)');
  }

  return result;
}

export default function App() {
  const [activeTool, setActiveTool] = useState('select');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    document.body.classList.add('is-exporting-pdf');

    // Storage to restore styles after PDF generation completes
    const linksToRestore: { element: HTMLElement; placeholder: Comment }[] = [];
    const originalStyles = new Map<HTMLStyleElement, string>();
    const originalInlineStyles = new Map<HTMLElement, string>();
    const originalGetComputedStyle = window.getComputedStyle;

    try {
      const loadHtml2Pdf = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          if ((window as any).html2pdf) {
            resolve((window as any).html2pdf);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve((window as any).html2pdf);
          script.onerror = (err) => reject(err);
          document.body.appendChild(script);
        });
      };

      const html2pdf = await loadHtml2Pdf();

      // Override getComputedStyle to sanitize on the fly for html2canvas
      window.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
        const style = originalGetComputedStyle.call(window, el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  return sanitizeColorString(val);
                }
                return val;
              };
            }
            
            const val = (target as any)[prop];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return sanitizeColorString(val);
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };

      // 1. Temporarily fetch and inline external stylesheets to prevent CORS error or failed fetches by html2canvas
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      for (const link of stylesheets) {
        try {
          const href = link.getAttribute('href');
          if (href) {
            const res = await fetch(href);
            if (res.ok) {
              const text = await res.text();
              const style = document.createElement('style');
              style.setAttribute('data-inlined-from', href);
              style.textContent = text;
              
              link.parentNode?.insertBefore(style, link);
              const placeholder = document.createComment('placeholder-for-link');
              link.parentNode?.insertBefore(placeholder, link);
              link.remove();
              
              linksToRestore.push({ element: link as HTMLElement, placeholder });
            }
          }
        } catch (err) {
          console.error('Failed to inline stylesheet for PDF compilation:', err);
        }
      }

      // 2. Sanitize all <style> blocks (including inlined ones) from modern color schemes unsupported by html2canvas
      const styleElements = Array.from(document.querySelectorAll('style'));
      styleElements.forEach((style) => {
        originalStyles.set(style, style.textContent || '');
        style.textContent = sanitizeColorString(style.textContent || '');
      });

      // 3. Sanitize inline styled elements
      const styledElements = Array.from(document.querySelectorAll('[style*="oklch"], [style*="oklab"]'));
      styledElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        originalInlineStyles.set(htmlEl, htmlEl.getAttribute('style') || '');
        const sanitized = sanitizeColorString(htmlEl.getAttribute('style') || '');
        htmlEl.setAttribute('style', sanitized);
      });

      const element = document.getElementById('root') || document.body;

      const opt = {
        margin: [4, 4, 4, 4],
        filename: 'Vibe_Creative_Portfolio_2026.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#0B0B0B',
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a3', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      // Restore standard computed style accessor
      window.getComputedStyle = originalGetComputedStyle;

      // 4. Restore original stylesheets and inline styles perfectly
      originalStyles.forEach((originalText, styleEl) => {
        styleEl.textContent = originalText;
      });

      originalInlineStyles.forEach((originalText, htmlEl) => {
        htmlEl.setAttribute('style', originalText);
      });

      const inlinedStyleTags = Array.from(document.querySelectorAll('style[data-inlined-from]'));
      inlinedStyleTags.forEach((el) => el.remove());

      linksToRestore.forEach(({ element, placeholder }) => {
        placeholder.parentNode?.insertBefore(element, placeholder);
        placeholder.remove();
      });

      document.body.classList.remove('is-exporting-pdf');
      setIsExporting(false);
    }
  };

  const testimonials = [
    {
      text: "Vibe completely captured the raw energy of our streetwear label. Seamless assets delivered that increased our user interaction by 45%. Highly recommended for bold brands.",
      client: "sovik DAS",
      company: "",
      role: "graphic designer enthusiasts"
    },
    {
      text: "Exceptional editorial layout skills and precision. The packaging decals and thermal heatmap labels receive absolute compliments from distributors worldwide.",
      client: "Sarah Jenkins",
      company: "CHRONOS COFFEE",
      role: "Founder"
    }
  ];

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen relative overflow-x-hidden selection:bg-[#FF0000] selection:text-white">
      {/* GLOBAL NAVBAR */}
      <div className="pdf-hide">
        <Navbar />
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1️⃣ HERO SECTION */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen w-full flex flex-col justify-between pt-24 md:pt-32 pb-16 z-10 px-6 md:px-12 bg-[#0B0B0B]">
        
        {/* Floating Creative Tool Box on the Left (Illustrator/Figma style detail) */}
        <div className="hidden lg:flex fixed left-6 top-1/2 transform -translate-y-1/2 flex-col items-center gap-1.5 p-2 bg-[#1A1A1A] border-2 border-black rounded-lg shadow-2xl z-30 ring-1 ring-white/5 pdf-hide">
          <div className="w-5 h-[3px] bg-neutral-600 rounded-full mb-2" />
          {TOOLBAR_TOOLS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`w-9 h-9 flex items-center justify-center border-2 transition-all duration-200 group relative rounded cursor-pointer ${
                  isActive
                    ? 'bg-[#FF0000] border-black text-white scale-110 shadow-lg'
                    : 'bg-[#0B0B0B] border-transparent text-gray-400 hover:text-white hover:bg-neutral-800'
                }`}
                title={t.name}
              >
                <Icon className="w-4 h-4" />
                {/* TOOL TIP */}
                <div className="absolute left-12 px-2.5 py-1 bg-black text-[10px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none rounded shadow-md border border-white/5">
                  {t.name}
                </div>
              </button>
            );
          })}
          <div className="w-6 h-[1px] bg-neutral-700/50 my-2" />
          {/* Active indicator swatch color card */}
          <div className="w-6 h-6 bg-[#FF0000] border-2 border-[#FFFFFF] shadow-md relative" title="Primary Color Accent hex: #FF0000">
            <div className="absolute bottom-[-4px] right-[-4px] w-4 h-4 bg-black border border-white/40" />
          </div>
        </div>

        {/* TOP LEFT CREATIVE MARGIN INFO */}
        <div className="max-w-7xl mx-auto w-full flex justify-between items-start pt-6">
          <div className="flex flex-col gap-1 text-left">
            <span className="font-mono text-xs text-[#FF0000] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF0000] animate-pulse rounded-full" />
              AVAILAIBLE FOR WORK//2026
            </span>
            <p className="font-sans text-[11px] text-gray-500 uppercase">
              REVOLUTIONARY DIGITAL SPECIFICATIONS & GRAPHIC BRAND SYSTEMS
            </p>
          </div>

          <div className="hidden sm:flex text-right flex-col gap-0.5 font-mono text-xs text-gray-400">
            <span>LOC: INDIA / GLOBAL</span>
          </div>
        </div>

        {/* HERO TITLE CONTAINER WITH DETAILED RIPPED PAPERCUT RED ACCENT */}
        <div className="max-w-5xl mx-auto w-full text-center my-auto relative">
          
          {/* Little Peeking Mascot Top-Right */}
          <div className="absolute top-[-40px] right-[5%] sm:right-[15%] z-20">
            <CoolAvatar size={70} className="transform rotate-12" />
          </div>

          {/* Subheader Title */}
          <span className="block font-mono text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#D9D9D9] mb-4">
            CREATIVE GRAPHIC DESIGNER
          </span>

          {/* GIGANTIC TORN RIPPED TEXT */}
          <div className="relative w-full flex flex-col items-center">
            
            {/* Split Top "PORTFOLIO" Layer */}
            <div className="overflow-hidden w-full h-[55px] sm:h-[100px] md:h-[135px] relative">
              <h1 className="text-white text-7xl sm:text-9xl md:text-[160px] lg:text-[190px] font-black font-display tracking-tight leading-none uppercase select-none">
                PORTFOLIO
              </h1>
            </div>

            {/* Red Jagged Ripped Banner dividing the letters physically */}
            <div className="w-full relative z-20 my-[-8px] sm:my-[-14px]">
              <TornDivider color="#FF0000" accentColor="#800000" orientation="down" className="h-[25px] sm:h-[35px]" seed={12} />
              <div className="bg-[#FF0000] py-1 sm:py-2 flex items-center justify-center gap-6 overflow-hidden relative border-t border-b border-black">
                {/* Horizontal Marquee repeating tagline inside split */}
                <div className="flex gap-4 font-display text-white text-sm sm:text-xl font-bold tracking-widest animate-marquee whitespace-nowrap select-none">
                  <span>BUILDING BOLD BRAND IDENTITIES • INTERACTIVE PRINT LAYOUTS • DIGITAL STREETWEAR SPECIFICATIONS • VIBE CODED • </span>
                  <span>BUILDING BOLD BRAND IDENTITIES • INTERACTIVE PRINT LAYOUTS • DIGITAL STREETWEAR SPECIFICATIONS • VIBE CODED • </span>
                </div>
              </div>
              <TornDivider color="#0B0B0B" orientation="up" className="h-[25px] sm:h-[35px]" seed={21} />
            </div>

            {/* Split Bottom "PORTFOLIO" Layer */}
            <div className="overflow-hidden w-full h-[55px] sm:h-[100px] md:h-[135px] relative mt-[-8px] sm:mt-[-14px]">
              <h1 className="text-white text-7xl sm:text-9xl md:text-[160px] lg:text-[190px] font-black font-display tracking-tight leading-none uppercase select-none -translate-y-[50%]">
                PORTFOLIO
              </h1>
            </div>

          </div>

          <h3 className="font-mono text-xs sm:text-sm tracking-widest uppercase font-bold text-gray-500 mt-6 sm:mt-8">
            SPEC.EDITION // <span className="text-[#FF0000]">BUILDING BOLD BRAND DESIGN</span>
          </h3>
        </div>

        {/* BOTTOM NAVIGATION / TAGLINE AREA & SCROLL INDICATOR */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
          <div className="text-center sm:text-left">
            <p className="font-sans text-sm text-gray-400 font-medium max-w-sm leading-snug">
              “Specializing in logo development, Brand MAnuals design, and digital visual assets for raw trendsetting companies.”
            </p>
          </div>
          
          <button
            onClick={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 font-mono text-xs text-white/90 hover:text-[#FF0000] border border-white/10 hover:border-[#FF0000] px-4 py-2.5 transition-all duration-300 group cursor-pointer"
          >
            <span>SCROLL TO STUDY INQUIRIES</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2️⃣ ABOUT SECTION (Torn Paper Transition to LIGHT BACKGROUND) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div id="about" className="relative bg-[#F4F4F4] text-[#0B0B0B] transition-colors duration-300">
        
        {/* Dynamic Black torn transition divider pointing down */}
        <TornDivider color="#F4F4F4" bgClass="text-[#0B0B0B]" orientation="down" className="h-[40px] md:h-[70px] absolute top-[-30px] md:top-[-60px] left-0 z-20" seed={14} />

        <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          
          {/* Peeking Mascot Bottom-Right of About Section */}
          <div className="absolute right-12 bottom-6 z-10">
            <CoolAvatar size={60} className="transform -rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
            
            {/* Left Column: Biographic elements & visual titles */}
            <div className="md:col-span-7 text-left flex flex-col gap-6">
              
              <div className="flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#FF0000]" />
                <span className="font-mono text-xs text-[#FF0000] font-black uppercase tracking-widest">
                  02 // DESIGNER BACKGROUND
                </span>
              </div>

              <h2 className="font-display text-5xl sm:text-7xl font-black uppercase leading-tight tracking-tight text-neutral-900">
                ABOUT ME <br />
                <span className="text-[#FF0000]">CREATIVE PROS</span>
              </h2>

              <p className="font-sans text-sm text-neutral-600 leading-relaxed max-w-xl">
                Passionate and creative Graphic Designer enthusiast with a strong eye for modern visuals, branding, and digital storytelling. Skilled in creating impactful designs that combine creativity, aesthetics, and clear communication. Dedicated to transforming ideas into visually engaging experiences through innovative and professional design solutions.
              </p>



            </div>

            {/* Right Column: Rounded arch portrait with Red background element and solid borders */}
            <div className="md:col-span-5 flex justify-center relative">
              <div className="relative w-[280px] sm:w-[320px]">
                
                {/* Red Backdrop Shape (offset for depth) */}
                <div 
                  className="absolute inset-0 bg-[#FF0000] rounded-t-[140px] transform translate-x-4 translate-y-4"
                  style={{ borderRadius: '160px 160px 0 0' }}
                />

                {/* Main image container */}
                <div 
                  className="relative h-[380px] w-full overflow-hidden border-4 border-[#0B0B0B] bg-neutral-200"
                  style={{ borderRadius: '160px 160px 0 0' }}
                >
                  <img
                    src="https://i.ibb.co/7dNDjcrT/Whats-App-Image-2026-05-29-at-11-54-31-AM.jpg"
                    alt="Creative Portrait of the designer"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* High contrast overlay vignette inside */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/30 to-transparent" />
                </div>

                {/* Subtitle Label Badge tag */}
                <div className="absolute bottom-5 left-[-20px] bg-[#0B0B0B] text-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider border border-white/10 select-none shadow-lg rotate-[-2deg]">
                  graphic designer Enthusiast
                </div>

              </div>
            </div>

          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* 3️⃣ SKILLS + TOOLS + APPROACH TO DESIGN CONTRAST CONTAINER */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="mt-20 bg-[#FF0000] text-white p-8 md:p-12 relative flex flex-col md:flex-row gap-8 justify-between border-4 border-black box-border">
            
            {/* Column 1: Core Skills List */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-white rounded-full" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider">SKILLS</h3>
              </div>
              <ul className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider space-y-1">
                <li className="hover:translate-x-2 transition-transform duration-200">GRAPHIC DESIGN</li>
                <li className="hover:translate-x-2 transition-transform duration-200 text-[#000000]">SOCIAL MEDIA</li>
              </ul>
            </div>

            {/* Column 2: Digital Tools Grid */}
            <div className="flex-1 text-left md:border-l md:border-r md:border-white/20 md:px-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-white rounded-full" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider">SOFTWARE SUITE</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3.5 font-mono">
                {/* Real-world custom retro Adobe-like tool blocks */}
                <div className="flex items-center gap-2 bg-[#0B0B0B] border-2 border-black p-2.5 rounded-none shadow-inner" title="Adobe Photoshop Creative Suite">
                  <div className="text-xs bg-[#001D26] text-[#00C4FF] font-black w-7 h-7 rounded flex items-center justify-center font-sans tracking-tighter border border-[#00C4FF]/20">Ps</div>
                  <span className="text-[10px] font-bold text-white uppercase">PHOTOSHOP</span>
                </div>
                
                <div className="flex items-center gap-2 bg-[#0B0B0B] border-2 border-black p-2.5 rounded-none shadow-inner" title="Adobe Premiere Pro Video Editor">
                  <div className="text-xs bg-[#14002B] text-[#9999FF] font-black w-7 h-7 rounded flex items-center justify-center font-sans tracking-tighter border border-[#9999FF]/20">Pr</div>
                  <span className="text-[10px] font-bold text-white uppercase">premiur pro</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0B0B0B] border-2 border-black p-2.5 rounded-none shadow-inner" title="Adobe After Effects Motion Engine">
                  <div className="text-xs bg-[#1A0026] text-[#CF00FF] font-black w-7 h-7 rounded flex items-center justify-center font-sans tracking-tighter border border-[#CF00FF]/25">Ae</div>
                  <span className="text-[10px] font-bold text-white uppercase">AFTER EFFECTS</span>
                </div>


              </div>
            </div>

            {/* Column 3: Intentional Core Philosophy message */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-white rounded-full" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider">APPROACH TO DESIGN</h3>
              </div>
              <p className="font-sans text-xs text-stone-100 leading-relaxed max-w-sm">
                “My design approach focuses on simplicity, creativity, and strong visual communication. I aim to create designs that are both aesthetic and effective.” Let us formulate an impactful brand story from sketch to apparel, with zero fluff.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 4️⃣ PORTFOLIO PROJECTS SECTION (Custom showcase views) */}
      {/* ──────────────────────────────────────────────────────── */}
      <ProjectShowcase />

      {/* ──────────────────────────────────────────────────────── */}
      {/* 5️⃣ GOOGLE DOCS BRIEF & COLLABORATOR WORKSPACE           */}
      {/* ──────────────────────────────────────────────────────── */}
      <GoogleDocsCollaborator />

      {/* ──────────────────────────────────────────────────────── */}
      {/* 6️⃣ BRAND TESTIMONIALS (Brutalist mini-slider) */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-neutral-950 text-white relative border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <Award className="w-10 h-10 text-[#FF0000] animate-pulse" />
          
          <span className="font-mono text-xs text-gray-500 font-bold uppercase tracking-widest">
            DIrector QUOTATION
          </span>

          <div className="min-h-[140px] flex items-center justify-center">
            <p className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight text-white/95 italic max-w-2xl leading-snug">
              “{testimonials[activeTestimonial].text}”
            </p>
          </div>

          <div className="flex flex-col items-center mt-2">
            <span className="font-mono text-[#FF0000] text-xs font-black uppercase">
              {testimonials[activeTestimonial].client}
            </span>
            <span className="font-mono text-gray-500 text-[10px] tracking-wide uppercase">
              {testimonials[activeTestimonial].role}
              {testimonials[activeTestimonial].company ? ` / ${testimonials[activeTestimonial].company}` : ''}
            </span>
          </div>

          {/* Silder paginator keys */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-3.5 h-3.5 rounded-none border border-[#FF0000] cursor-pointer ${
                  activeTestimonial === idx ? 'bg-[#FF0000]' : 'bg-transparent'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 7️⃣ CONTACT CTA & FORM SECTION */}
      {/* ──────────────────────────────────────────────────────── */}
      <ContactForm />

      {/* ──────────────────────────────────────────────────────── */}
      {/* 8️⃣ BRUTALIST FOOTER */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="relative bg-[#0B0B0B] text-white">
        
        {/* White Torn Divider Separator leading to bottom banner board */}
        <TornDivider color="#F4F4F4" bgClass="text-[#0B0B0B]" orientation="up" className="h-[40px] md:h-[60px]" seed={35} />

        {/* BOTTOM METADATA WRAPPER */}
        <div className="bg-[#F4F4F4] text-black py-16 px-6 md:px-12 border-t border-black/10">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            
            {/* GIGANTIC LET'S WORK TOGETHER STAGE REVEAL */}
            <div className="text-center w-full relative">
              <span className="text-black/5 font-black font-display text-7xl sm:text-[180px] tracking-tighter absolute inset-0 select-none pointer-events-none top-[-20px] md:top-[-60px]">
                LET'S WORK
              </span>

              <h2 className="font-display text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-none tracking-tight text-neutral-900 relative z-10 select-none">
                TOGETHER<span className="text-[#FF0000]">!</span>
              </h2>

              {/* Pop up character avatar smiling right beneath */}
              <div className="flex justify-center mt-3 relative z-10">
                <CoolAvatar size={80} className="transform rotate-2 hover:scale-105 duration-300 pointer-events-auto" />
              </div>
            </div>

            {/* SERVICES MATRIX LINE BLOCK */}
            <div className="w-full flex-wrap border-t border-b border-black/15 py-5 font-mono text-xs font-black flex justify-around items-center gap-4 text-center">
              <span>GRAPHIC DESIGN</span>
              <span className="hidden sm:inline text-neutral-400">|</span>
              <span>BRANDING DESIGN</span>
              <span className="hidden sm:inline text-neutral-400">|</span>
              <span>LOGO DESIGN</span>
              <span className="hidden sm:inline text-neutral-400">|</span>
              <span>PRINT MEDIA DESIGN</span>
            </div>

            {/* BOTTOM BAR COPYRIGHT & LINKS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-neutral-500 font-mono text-xs">
              <div className="text-left w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-5">
                <span className="font-black text-black">VIBE STUDIO © 2026</span>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="pdf-hide bg-black hover:bg-[#FF0000] hover:text-white active:scale-95 text-white font-mono text-[10px] font-black uppercase tracking-wider px-4 py-2 border-2 border-black flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:bg-neutral-400 disabled:border-neutral-400"
                  title="Generate high fidelity physical PDF layout"
                >
                  {isExporting ? (
                    <>
                      <span className="animate-spin block rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                      <span>PRINTING DESIGN BRIEF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>EXPORT PORTFOLIO PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Channels */}
              <div className="flex gap-4 w-full md:w-auto md:justify-end">
                <a href="#" className="w-9 h-9 bg-neutral-900 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors shadow" title="Vibe on Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-neutral-900 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors shadow" title="Vibe on LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-neutral-900 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors shadow" title="Vibe on GitHub">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-neutral-900 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors shadow" title="Vibe on Youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </footer>
    </div>
  );
}
