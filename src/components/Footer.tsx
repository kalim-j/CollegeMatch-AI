"use client";

import { 
  Phone, Mail, MapPin, Instagram, Twitter, Linkedin, 
  ArrowUpRight, ShieldCheck, Zap, Heart
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Footer() {
  const pathname = usePathname();
  const isPageHidden = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isPageHidden) return null;

  const footerLinks = {
    platform: [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Study Planner", href: "/study-planner" },
      { name: "Mock Interview", href: "/mock-interview" },
      { name: "Resume Builder", href: "/resume" },
      { name: "Career Explorer", href: "/career-explorer" },
      { name: "Scholarship Finder", href: "/scholarships" },
      { name: "Entrance Exams", href: "/exams" }
    ],
    support: [
      { name: "Contact Support", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Submit Testimonial", href: "/testimonial" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" }
    ],
    social: [
      { name: "X", href: "https://twitter.com/", icon: Twitter },
      { name: "Instagram", href: "https://www.instagram.com/_kalim07/", icon: Instagram },
      { name: "LinkedIn", href: "https://www.linkedin.com/in/kalim-j/", icon: Linkedin }
    ]
  };

  return (
    <footer 
      className="relative border-t border-white/5 pt-32 pb-8 sm:pb-16 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, transparent 0px, #05071a 60px)'
      }}
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div 
          className="mb-24"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(32px, 5vw, 48px)'
          }}
        >
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <p className="text-white/40 text-[15px] leading-relaxed font-medium max-w-sm">
              India's most advanced AI-powered admission engine. We help 10,000+ students discover their perfect college match with precision and transparency.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((s) => (
                <Link 
                  key={s.name} 
                  href={s.href}
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-xl"
                >
                  <s.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          </div>

          {/* Links Columns */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-white/50 hover:text-indigo-400 transition-colors flex items-center gap-2 group font-bold text-sm">
                    {l.name} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-white/50 hover:text-indigo-400 transition-colors flex items-center gap-2 group font-bold text-sm">
                    {l.name} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Expert Support</h4>
             <div className="space-y-6">
                <a href="tel:+919363554551" className="flex items-center gap-4 group">
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Call Expert</p>
                      <p className="text-white font-bold text-sm">+91 9363554551</p>
                   </div>
                </a>
                <a href="mailto:kalim.apoffi@gmail.com" className="flex items-center gap-4 group overflow-hidden">
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-lg shrink-0">
                      <Mail size={18} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Email Us</p>
                      <p className="text-white font-bold text-sm truncate">kalim.apoffi@gmail.com</p>
                   </div>
                </a>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div className="flex flex-col md:flex-row items-center gap-2 text-white/20 text-xs font-bold">
              <span>© 2026 CollegeMatch AI. All rights reserved.</span>
           </div>
           
           <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-indigo-400" /> 🔒 DATA SECURE
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                 <Zap size={14} className="text-teal-400" /> Powered by Groq AI
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                 <MapPin size={14} className="text-orange-400" /> 🇮🇳 MADE IN INDIA
              </div>
           </div>

           <div className="text-white/20 text-[11px] font-bold flex items-center gap-2">
              Made with <Heart size={12} className="text-red-500/50 fill-red-500/50" /> for Indian Students
           </div>
        </div>
      </div>
    </footer>
  );
}
