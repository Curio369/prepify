"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="max-w-2xl">
            <h2 className={`text-5xl md:text-6xl lg:text-[100px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Ready to
              <br />
              <span className="text-zinc-500">transform your prep?</span>
            </h2>

            <p className={`mt-8 text-xl text-zinc-400 leading-relaxed transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              Join serious JEE and NEET aspirants practicing in the real NTA environment. Stop wasting time on paper and start analyzing your mistakes today.
            </p>

            <div className={`mt-10 flex flex-wrap items-center gap-4 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              {/* Primary Button */}
              <a 
                href="upload" 
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-colors group"
              >
                Upload your first DPP
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
              
              {/* Secondary Button */}
              <a 
                href="#how-it-works" 
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                See how it works
              </a>
            </div>

            <p className={`mt-6 text-sm font-mono text-zinc-500 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              5 free DPP uploads available today.
            </p>
          </div>

          {/* Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
          }`}>
            <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
              {/* Make sure the image name matches what is in your public/images folder! */}
              <img
                src="/images/bridge.png" 
                alt="AI connecting study materials"
                className="w-full h-full object-cover opacity-90"
              />
              {/* Gradient overlay to blend it slightly */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}