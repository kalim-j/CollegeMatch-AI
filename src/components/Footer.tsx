"use client";

import { 
  Phone, Mail, MapPin, Instagram, Twitter, Linkedin, 
  ArrowUpRight, Sparkles, GraduationCap, ShieldCheck, 
  Zap, Heart
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const isPageHidden = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isPageHidden) return null;

    support: [
      { name: "Contact Support", href: "/contact" },
      { name: "Submit Testimonial", href: "/testimonial" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
    social: [
      { name: "Twitter", href: "#", icon: Twitter },
      { name: "Instagram", href: "#", icon: Instagram },
      { name: "LinkedIn", href: "#", icon: Linkedin },
    ]
  };

  return (
    <footer className="relative bg-[#0a0d14] border-t border-white/5 pt-32 pb-16 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
                CM
              </div>
              <span className="text-2xl font-black text-white font-syne tracking-tight">CollegeMatch-AI</span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-sm">
              The ultimate AI-driven destination for Indian students to optimize their higher education journey. Transparent, accurate, and always free.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((s) => (
                <Link 
                  key={s.name} 
                  href={s.href}
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-xl"
                >
                  <s.icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div className="space-y-8">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Platform</h4>
              <ul className="space-y-4">
                {footerLinks.platform.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 group font-bold">
                      {l.name} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 group font-bold">
                      {l.name} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-8">
             <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Direct Contact</h4>
             <div className="space-y-6">
                <a href="tel:+919363554551" className="flex items-center gap-4 group">
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Phone size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Call Expert</p>
                      <p className="text-white font-black">+91 93635 54551</p>
                   </div>
                </a>
                <a href="mailto:support@collegematch-ai.com" className="flex items-center gap-4 group">
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Mail size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email Us</p>
                      <p className="text-white font-black">support@collegematch-ai.com</p>
                   </div>
                </a>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400">
                      <MapPin size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Office</p>
                      <p className="text-white font-black">Coimbatore, Tamil Nadu</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
              <span>© {new Date().getFullYear()} CollegeMatch-AI</span>
              <span className="h-1 w-1 rounded-full bg-slate-800" />
              <span>Inspiring ambition since 2024</span>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-primary" /> GDPR Compliant
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <Zap size={14} className="text-yellow-500" /> Powered by AI
              </div>
           </div>

           <div className="text-slate-600 text-xs font-bold flex items-center gap-2">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> for Indian Students
           </div>
        </div>
      </div>
    </footer>
  );
}
