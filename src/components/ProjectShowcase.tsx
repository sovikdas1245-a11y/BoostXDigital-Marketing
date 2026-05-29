import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, X, ArrowUpRight, Zap, RefreshCw, Palette } from 'lucide-react';

const CATEGORIES: ('All' | 'POSTER' | 'Social Media' | 'Branding')[] = [
  'All',
  'POSTER',
  'Social Media',
  'Branding',
];

const PROJECTS_DATA: Project[] = [
  {
    id: '1',
    title: 'THE GOAT OF OLD TOWN',
    category: 'POSTER',
    description: 'A bold and dynamic tribute graphic celebrating Cristiano Ronaldo, designed with a striking red-and-black visual identity that reflects passion, power, and intensity. The composition combines a dramatic monochrome portrait with an action shot of Ronaldo in motion, creating a strong sense of energy and dominance. The oversized “7” and vertical typography emphasize his iconic legacy, while the textured background and national emblem enhance the overall depth and patriotic feel of the artwork.',
    imageUrl: 'https://i.ibb.co/tTD84pW7/Idol-Ronaldo.jpg',
    client: 'Rebel Apparel Co.',
    year: '2026',
    tags: ['Brand Identity', 'Packaging mockup', 'Typographic Framework', 'Capsule Design'],
    specs: ['Core Pantone: Black & Solid Red', 'Typography: custom sans & monospaced grids', 'Production: screenprinted custom tags'],
    beforeImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', // standard t-shirt placeholder
    afterImage: 'https://i.ibb.co/tTD84pW7/Idol-Ronaldo.jpg',
  },
  {
    id: '2',
    title: 'TURN DREAMS INTO REALITY',
    category: 'Social Media',
    description: 'This motivational graphic features a creative half-portrait composition combined with elegant oversized typography to create a modern and inspiring visual. The soft pink and neutral color palette gives the design a calm, aesthetic, and sophisticated feel, while the message “Work Hard Dream Big” represents ambition, dedication, and confidence. The minimal geometric elements and editorial-style layout enhance the overall premium look, making the artwork visually engaging and emotionally uplifting.',
    imageUrl: 'https://i.ibb.co/NnLmGCn1/motivational-poster.jpg',
    client: 'Nocturnal Lab',
    year: '2025',
    tags: ['UI Framing', 'Instagram Feed', 'Motion Thumbnails', 'Social Identity'],
    specs: ['Sizing: optimized mobile viewport grids', 'Color: dark neutral with cyan-red contrast', 'Asset Delivery: 30-day continuous assets'],
    beforeImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800', // bland default social screenshot
    afterImage: 'https://i.ibb.co/NnLmGCn1/motivational-poster.jpg',
  },
  {
    id: '3',
    title: 'FEEL THE BEAT',
    category: 'POSTER',
    description: 'A bold and energetic promotional graphic designed to highlight the power and style of modern headphones. The striking red-and-black color scheme, oversized typography, and centered product placement create a strong visual impact that instantly grabs attention. The clean layout and discount callout effectively combine modern advertising aesthetics with a dynamic tech-inspired feel, making the design both eye-catching and market-focused.',
    imageUrl: 'https://i.ibb.co/b5NPgZky/HEADPHN-GRAPHICS.jpg',
    client: 'NEO APEX Esports',
    year: '2026',
    tags: ['Logo Design', 'Vector System', 'Brand Symbol', 'eSports Style'],
    specs: ['Vector grid precision with 8-direction alignment', 'Scalable down to 16x16px on-screen icon', 'Delivered in full vector systems'],
    beforeImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800', // rough pencil sketch backdrop
    afterImage: 'https://i.ibb.co/b5NPgZky/HEADPHN-GRAPHICS.jpg',
  },
  {
    id: '4',
    title: 'TASTE THE SUMMER WITH STARBUCKS',
    category: 'Branding',
    description: 'A fresh and vibrant beverage advertisement graphic inspired by Starbucks, designed with a refreshing green aesthetic and energetic visual composition. The floating drink centerpiece, combined with kiwi elements and splash effects, creates a lively and flavorful atmosphere that instantly captures attention. The bold typography and glowing highlights enhance the premium café vibe, making the design visually appealing, modern, and highly engaging for beverage promotion.',
    imageUrl: 'https://i.ibb.co/DgCdTyT2/Starbucks.jpg',
    client: 'Valkyrie Fuel Corp',
    year: '2026',
    tags: ['Packaging Layout', '3D Can Mockup', 'Regulatory Typography', 'Decal System'],
    specs: ['High contrast matte lacquer texture finish', 'Double hit white ink layers on dark steel cylinder', 'Regulatory chemical grid panels'],
    beforeImage: 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=800', // flat boring generic jar
    afterImage: 'https://i.ibb.co/DgCdTyT2/Starbucks.jpg',
  }
];

// Reusable Before-After Sweeper Component
function BeforeAfterSlider({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging.current) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleEnd);
  };

  const handleStart = () => {
    isDragging.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[250px] md:h-[350px] overflow-hidden select-none bg-neutral-900 border border-white/10"
    >
      {/* Before Image (Left side / base) */}
      <img
        src={beforeSrc}
        alt="Before sketch/source"
        className="absolute inset-0 w-full h-full object-cover grayscale"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 left-3 bg-neutral-950/80 border border-white/10 text-white font-mono text-[10px] px-2 py-0.5 z-10 font-bold">
        RAW CONCEPT / BEFORE
      </div>

      {/* After Image (Right side sweeping) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={afterSrc}
          alt="After rendered/final"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-[#FF0000] text-white font-mono text-[10px] px-2 py-0.5 z-10 font-bold">
          FINAL REBRAND / AFTER
        </div>
      </div>

      {/* Controller line and handle button */}
      <div
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="absolute top-0 bottom-0 w-[2px] bg-[#FF0000] cursor-ew-resize z-20 flex items-center justify-center group"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute w-8 h-8 rounded-full bg-[#0B0B0B] border-2 border-[#FF0000] flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg group-hover:scale-110">
          <RefreshCw className="w-3.5 h-3.5 text-[#FF0000]" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectShowcase() {
  const [selectedCat, setSelectedCat] = useState<'All' | 'POSTER' | 'Social Media' | 'Branding'>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects
  const filteredProjects = PROJECTS_DATA.filter((p) => {
    if (selectedCat === 'All') return true;
    return p.category === selectedCat;
  });

  return (
    <section id="projects" className="py-24 px-6 md:px-12 bg-[#0B0B0B] text-white relative">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION TITLE LAYERED */}
        <div className="relative mb-16 flex flex-col items-start">
          <span className="text-gray-900 font-black font-display text-7xl sm:text-9xl tracking-tighter absolute -top-12 sm:-top-[70px] left-0 select-none opacity-40">
            SHOWCASE
          </span>
          <div className="flex items-center gap-2 z-10">
            <div className="w-3 h-3 bg-[#FF0000] animate-pulse" />
            <h2 className="text-3xl font-display font-medium uppercase tracking-tight text-[#FF0000]">
              FEATURED PROJECTS
            </h2>
          </div>
          <p className="font-mono text-xs text-gray-400 mt-2 z-10 max-w-sm border-l pl-3 border-[#FF0000]">
            Curated branding redesigns, industrial product packaging mockups, and mobile system identity frameworks.
          </p>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12 border-b border-white/5 pb-6 font-mono text-xs pdf-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 text-left font-semibold uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#FF0000] text-white font-black'
                  : 'bg-[#1A1A1A] text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat}
              {selectedCat === cat && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-red-600" />
              )}
            </button>
          ))}
        </div>

        {/* MASONRY/GRID OF CARDS */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 cursor-pointer"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-[#1A1A1A] border border-white/5 hover:border-[#FF0000]/60 transition-all duration-500 overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Image container with skew overlay */}
                <div className="relative overflow-hidden aspect-4/3 w-full bg-neutral-900 border-b border-white/5">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#0B0B0B]/40 group-hover:bg-[#FF0000]/10 transition-colors duration-500" />
                  
                  {/* Category badge and year */}
                  <div className="absolute top-4 left-4 flex gap-1">
                    <span className="bg-[#FF0000] text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 font-mono">
                      {project.category}
                    </span>
                    <span className="bg-black/80 backdrop-blur-sm text-gray-300 text-[9px] font-bold px-2 py-1 font-mono">
                      {project.year}
                    </span>
                  </div>

                  {/* Absolute core hover action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <div className="px-5 py-3 bg-[#0B0B0B]/90 backdrop-blur border border-[#FF0000]/50 text-white font-mono text-xs font-semibold tracking-wider flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                      <Eye className="w-4 h-4 text-[#FF0000]" />
                      <span>CASE STUDY</span>
                      <ArrowUpRight className="w-3 h-3 text-[#FF0000]" />
                    </div>
                  </div>
                </div>

                {/* Info summary */}
                <div className="p-6 text-left flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-display text-2xl font-black tracking-tight text-white mb-2 group-hover:text-[#FF0000] transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="font-sans text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* DETAILED PROJECT MODAL LIGHTBOX */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0B0B]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="bg-[#1A1A1A] border border-[#FF0000]/30 w-full max-w-4xl text-left shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button top-right */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-40 bg-black/80 hover:bg-[#FF0000] text-white p-2.5 transition-colors border border-white/10"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top double layer paper찢 look mockup header */}
                <div className="bg-[#0B0B0B] p-6 md:p-8 border-b border-white/5 relative">
                  <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-widest text-[#FF0000] font-black">
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    <span>CASE STUDY ANALYSIS</span>
                  </div>
                  <h3 className="font-display text-3xl md:text-5xl font-black text-white leading-none">
                    {selectedProject.title}
                  </h3>
                  <p className="text-gray-400 font-sans text-sm mt-2 max-w-xl">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8">
                  
                  {/* Left Column: Visual Assets with simple beautiful display */}
                  <div className="md:col-span-7 flex flex-col gap-6">
                    <div className="aspect-16/10 w-full overflow-hidden border border-white/10">
                      <img
                        src={selectedProject.imageUrl}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Creative design color swatches (Aesthetic signature) */}
                    <div className="bg-black/40 p-4 border border-white/5 flex flex-col gap-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                        <Palette className="w-3.5 h-3.5 text-[#FF0000]" />
                        <span>AESTHETIC COLOR PALETTE WORKED:</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-7 bg-[#0B0B0B] border border-white/10 flex items-center justify-center text-[8px] font-mono text-gray-400">#0B</div>
                        <div className="w-10 h-7 bg-[#FF0000] border border-white/10 flex items-center justify-center text-[8px] font-mono text-white">#FF</div>
                        <div className="w-10 h-7 bg-[#FFFFFF] border border-white/10 flex items-center justify-center text-[8px] font-mono text-black">#FFF</div>
                        <div className="w-10 h-7 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[8px] font-mono text-gray-400">#1A</div>
                        <div className="w-10 h-7 bg-neutral-600 border border-white/10 flex items-center justify-center text-[8px] font-mono text-white">#6D</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Project Metadata */}
                  <div className="md:col-span-5 flex flex-col gap-6 justify-between">
                    <div>
                      <h4 className="font-mono text-xs font-black uppercase text-white mb-2">
                        DELIVERED TAXONOMY
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-white/5 text-gray-300 font-mono text-[10px] px-2.5 py-1 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>


                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
