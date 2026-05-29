import React, { useState } from 'react';
import { Send, Phone, Mail, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', projectType: 'Branding', budget: 'under_2k', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out the required fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', projectType: 'Branding', budget: 'under_2k', message: '' });
    setSubmitted(false);
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-black text-white relative border-t border-white/5">
      <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-8">
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-[#FF0000] animate-ping" />
            <span className="font-mono text-xs text-[#FF0000] font-black tracking-widest uppercase">
              GET IN TOUCH
            </span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none text-white">
            LET’S WORK <br />
            <span className="text-[#FF0000] relative">TOGETHER!</span>
          </h2>
        </div>

        <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed">
          INTERESTED in work with a BRAND and get a good guidence about the unexplored graphics designer area and improve more of my skill knowlege and bring the best of the creativity of myself to help the company to grow
        </p>

        {/* Core Info panels */}
        <div className="w-full flex justify-center font-mono text-xs">
          <a
            href="mailto:sovikdas1245@gmail.com"
            className="flex items-center gap-3 p-4 bg-[#1A1A1A] border border-white/5 hover:border-[#FF0000]/60 hover:bg-[#FF0000]/5 transition-all duration-300 w-full max-w-sm text-left justify-center"
          >
            <Mail className="w-4 h-4 text-[#FF0000]" />
            <div>
              <span className="text-gray-500 block text-[9px] uppercase">DIRECT INQUIRIES</span>
              <span className="text-white font-bold text-[11px]">sovikdas1245@gmail.com</span>
            </div>
          </a>
        </div>

      </div>
    </section>
  );
}
