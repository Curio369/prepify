"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";

// The new Freemium pricing model tailored for JEE/NEET aspirants
const plans = [
  {
    name: "Starter",
    description: "For daily rigorous practice.",
    price: { monthly: 0, annual: 0 },
    features: [
      "5 DPP uploads per day",
      "Up to 20 pages per upload",
      "Standard extraction speed",
      "Basic NTA interface",
      "Community support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "The Topper",
    description: "For serious JEE/NEET aspirants.",
    price: { monthly: 149, annual: 1490 },
    features: [
      "Unlimited DPP uploads",
      "Up to 50 pages per upload",
      "Priority Gemini 3.5 Flash queue",
      "100% Ad-free deep focus mode",
      "Advanced weak-chapter analytics",
      "Instant AI step-by-step solutions",
      "Unlimited LaTeX math rendering",
    ],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Coaching",
    description: "For institutes and batch owners.",
    price: { monthly: null, annual: null },
    features: [
      "Bulk DPP uploading",
      "Custom branding (White-label)",
      "Teacher analytics dashboard",
      "Student performance tracking",
      "Dedicated API limits",
      "24/7 Priority Support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
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
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40 bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            {/* Toggle switch for Monthly vs Annual */}
            <div className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
               <span className="w-12 h-px bg-white/30" />
               <div className="flex items-center gap-3 border border-white/20 rounded-full p-1 bg-white/[0.02]">
                  <button 
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-1.5 rounded-full text-sm font-mono transition-colors ${!isAnnual ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-1.5 rounded-full text-sm font-mono transition-colors ${isAnnual ? "bg-[#eca8d6] text-black" : "text-zinc-400 hover:text-white"}`}
                  >
                    Annually (Save 20%)
                  </button>
               </div>
            </div>

            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Invest in
              <br />
              <span className="text-zinc-600">your rank.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <img
                src="/images/whale.png"
                alt="AI Intelligence"
                className="w-full h-full object-contain object-center opacity-80 mix-blend-screen"
              />
            </div>
          </div>
        </div>

        {/* Pricing cards - Horizontal layout with overlap */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-0">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-[#050505] transition-all duration-700 ${
                  plan.highlight 
                    ? "border border-white/40 lg:-mx-2 lg:z-10 lg:scale-105 shadow-[0_0_50px_rgba(236,168,214,0.1)]" 
                    : "border border-white/10 lg:first:-mr-2 lg:last:-ml-2"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-[#eca8d6]" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan header */}
                  <div className="mb-8 pb-8 border-b border-white/10">
                    <span className="font-mono text-xs text-zinc-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2 text-white">{plan.name}</h3>
                    <p className="text-sm text-zinc-400 mt-2">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 h-20">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-display text-white">
                          ₹{isAnnual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-zinc-500 text-sm">{isAnnual ? "/year" : "/month"}</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-display text-white mt-4 block">Custom</span>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <p className="text-xs text-[#eca8d6] mt-2 font-mono">
                        {isAnnual ? "Billed ₹1,490 yearly" : "Billed ₹149 monthly"}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10 min-h-[250px]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" />
                        <span className="text-sm text-zinc-300 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                      plan.highlight
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "border border-white/20 text-white hover:border-white/50 hover:bg-white/5"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-white/10 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Secure payments via Razorpay
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Instant account activation
            </span>
          </div>
          <a href="#" className="text-sm underline underline-offset-4 text-zinc-400 hover:text-white transition-colors">
            Have questions? Contact support
          </a>
        </div>
      </div>
    </section>
  );
}