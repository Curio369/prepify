"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { name: "Features",      href: "#features"      },
  { name: "How it Works",  href: "#how-it-works"  },
  { name: "Exams",         href: "#exams"         },
  { name: "Metrics",       href: "#metrics"       },
  { name: "Pricing",       href: "#pricing"       },
];

function Avatar({ user }: { user: User }) {
  const name = user.user_metadata?.full_name || user.email || "User"
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
  const avatar = user.user_metadata?.avatar_url

  return (
    <div className="flex items-center gap-2.5">
      {avatar ? (
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
      )}
      <span className="text-sm text-white/80 hidden lg:block max-w-[120px] truncate">{name.split(" ")[0]}</span>
    </div>
  )
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  }

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <Image src="/Logos/logo-icon_light-Photoroom.png" alt="Prepify" width={80} height={36} style={{ height: 36, width: 'auto', flexShrink: 0 }} />
            <span className={`font-bold tracking-tight transition-all duration-500 ${isScrolled ? "text-lg text-foreground" : "text-xl text-white"}`}>Prepify</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-300 relative group ${isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-foreground" : "bg-white"}`} />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 focus:outline-none">
                  <Avatar user={user} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-foreground/10">
                      <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                    </div>
                    <a href="/uptet" className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 transition">UPTET Practice</a>
                    <a href="/ctet" className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 transition">CTET Practice</a>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition border-t border-foreground/10">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className={`transition-all duration-500 ${isScrolled ? "text-xs text-foreground/70 hover:text-foreground" : "text-sm text-white/70 hover:text-white"}`}>
                  Sign in
                </a>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                  className={`rounded-full transition-all duration-500 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6"}`}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {user && (
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-foreground/10">
              <Avatar user={user} />
              <div>
                <p className="text-sm font-semibold text-foreground">{user.user_metadata?.full_name || "User"}</p>
                <p className="text-xs text-foreground/50 truncate max-w-[200px]">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div
            className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
              isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            {user ? (
              <Button
                variant="outline"
                className="flex-1 rounded-full h-14 text-base text-red-500 border-red-500/30 hover:bg-red-500/5"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-14 text-base"
                  onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/login'; }}
                >
                  Sign in
                </Button>
                <Button
                  className="flex-1 bg-foreground text-background rounded-full h-14 text-base"
                  onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/login'; }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
