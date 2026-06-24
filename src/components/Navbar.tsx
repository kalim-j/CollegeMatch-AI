"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  GraduationCap, LayoutDashboard, History, User, 
  Phone, LogOut, Menu, X, Zap, Sparkles, 
  ArrowLeftRight, TrendingUp, Settings, ChevronDown,
  Search, Award, MessageSquare, Briefcase, MapPin,
  Sun, Moon
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Logo from "./Logo";
import { isAdminEmail } from "@/lib/admin";
import { useTheme } from "next-themes";

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const next = currentTheme === "light" ? "dark" : "light";
    setTheme(next);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAdminEmail(user?.email)) {
      const q = query(collection(db, "contacts"), where("status", "==", "new"));
      const unsub = onSnapshot(q, (snapshot) => {
        setPendingLeads(snapshot.size);
      });
      return () => unsub();
    }
  }, [user]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut(auth);
    router.push("/");
  };

  const handleNavClick = (sectionId: string) => {
    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const tools = [
    { name: "Find Colleges", href: "/interview", icon: Search },
    { name: "Compare Colleges", href: "/dashboard/compare", icon: ArrowLeftRight },
    { name: "Cutoff Predictor", href: "/dashboard/predictor", icon: TrendingUp },
    { name: "College Map", href: "/colleges/map", icon: MapPin },
    { name: "Scholarship Finder", href: "/dashboard/scholarships", icon: Award },
    { name: "Entrance Exam Guide", href: "/exams", icon: Briefcase },
    { name: "Submit Review", href: "/testimonial", icon: MessageSquare },
  ];

  const isAdmin = isAdminEmail(user?.email);

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <nav style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.05)',
      background: isDark
        ? 'rgba(5,7,26,0.92)'
        : 'rgba(255,255,255,0.92)',
      gap: '0',
    }}>
      {/* LEFT — Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0, textDecoration: 'none', width: 'auto' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7F77DD,#1D9E75)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, boxShadow: '0 4px 12px rgba(127,119,221,0.2)' }}>
          🎓
        </div>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', lineHeight:1.2 }}>
          <span style={{ fontSize:'15px', fontWeight:600, color: isDark ? 'white' : '#1a1340', whiteSpace:'nowrap' }}>
            CollegeMatch-AI
          </span>
          <span style={{ fontSize:'10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.45)' : '#7a7399', marginTop: 0 }}>
            India's smartest college advisor
          </span>
        </div>
      </Link>

      {/* CENTER — Nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:'4px', flex:1, justifyContent:'center', flexWrap:'nowrap', overflow:'hidden' }} className="hidden lg:flex">
        {!user ? (
          <>
            <button onClick={() => handleNavClick("how-it-works")} style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer' }}>How it works</button>
            <button onClick={() => handleNavClick("features")} style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer' }}>Features</button>
            <Link href="/cutoff-calculator" style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: pathname === '/cutoff-calculator' ? 600 : 400 }}>Cutoff</Link>
            <DropdownMenu>
              <DropdownMenuTrigger style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                2026 Resources <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-[#0a0d14] border-gray-200 dark:border-white/10 mt-2 z-[200]">
                <DropdownMenuItem asChild><Link href="/nep-guide" className="cursor-pointer">NEP 2026 Guide</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/placements" className="cursor-pointer">Placement Explorer</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/loan-calculator" className="cursor-pointer">Loan Calculator</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/first-gen" className="cursor-pointer">First-Gen Student</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/parent-guide" className="cursor-pointer">Parent Guide</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact" style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: pathname === '/contact' ? 600 : 400 }}>Contact</Link>
          </>
        ) : (
          <>
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Colleges', href: '/interview' },
              { label: 'Compare', href: '/dashboard/compare' },
              { label: 'Predictor', href: '/dashboard/predictor' },
              { label: 'Map', href: '/colleges/map' },
              { label: 'Scholarships', href: '/dashboard/scholarships' },
              { label: 'Exams', href: '/exams' },
              { label: 'Review', href: '/testimonial' },
              { label: 'History', href: '/history' }
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: pathname === link.href ? 600 : 400 }}>
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                2026 <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-[#0a0d14] border-gray-200 dark:border-white/10 mt-2 z-[200]">
                <DropdownMenuItem asChild><Link href="/nep-guide" className="cursor-pointer w-full">NEP 2026 Guide</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/placements" className="cursor-pointer w-full">Placement Explorer</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/loan-calculator" className="cursor-pointer w-full">Loan Calculator</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/first-gen" className="cursor-pointer w-full">First-Gen Student</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/parent-guide" className="cursor-pointer w-full">Parent Guide</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact" style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: pathname === '/contact' ? 600 : 400 }}>Contact</Link>
          </>
        )}
      </div>

      {/* RIGHT — Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
        {mounted && (
          <button onClick={toggleTheme} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: isDark ? 'white' : '#1a1340', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Toggle theme">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        )}

        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {isAdmin && (
              <Link href="/admin" style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', position: 'relative', textDecoration: 'none' }}>
                Admin
                {pendingLeads > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, height: 16, minWidth: 16, padding: '0 4px', background: '#f59e0b', color: 'white', fontSize: 8, fontWeight: 900, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fbcfe8' }}>
                    {pendingLeads}
                  </span>
                )}
              </Link>
            )}
            <Link href="/profile" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration: 'none' }}>
              <div className="hidden sm:flex" style={{ flexDirection:'column', alignItems:'flex-end' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', lineHeight: 1 }}>{profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.2, marginTop: '2px' }}>Student Profile</span>
              </div>
              <Avatar style={{ width: 32, height: 32, flexShrink: 0, border: '1px solid rgba(127,119,221,0.3)' }}>
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback style={{ background: 'rgba(127,119,221,0.1)', color: '#7F77DD', fontSize: 12, fontWeight: 700 }}>
                  {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <button onClick={handleSignOut} className="hidden sm:flex" style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex" style={{ alignItems:'center', gap:'10px' }}>
            <Link href="/login" style={{ fontSize: '12px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.8)' : '#1a1340', padding: '6px 12px', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{ fontSize: '12px', fontWeight: 700, color: 'white', background: '#534AB7', padding: '6px 16px', borderRadius: 8, textDecoration: 'none' }}>Sign Up</Link>
          </div>
        )}

        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)} style={{ color: isDark ? 'white' : '#1a1340', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 lg:hidden bg-[#0a0d14]/95 backdrop-blur-2xl border-t border-white/5 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
           <div className="flex flex-col p-6">
             {user ? (
               <>
                 <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Dashboard</Link>
                 
                 <div className="py-4 border-b border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tools</p>
                   <div className="space-y-1">
                     {tools.map(tool => (
                       <Link 
                         key={tool.href} 
                         href={tool.href} 
                         onClick={() => setIsOpen(false)} 
                         className="flex items-center gap-3 text-slate-400 hover:text-white py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
                       >
                         <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                           <tool.icon size={16} />
                         </div>
                         <span className="font-medium">{tool.name}</span>
                       </Link>
                     ))}
                   </div>
                 </div>
                 
                 <Link href="/history" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">History</Link>
                 <div className="py-4 border-b border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">2026 Resources</p>
                   <div className="space-y-1">
                     <Link href="/nep-guide" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">NEP 2026 Guide</Link>
                     <Link href="/placements" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Placement Explorer</Link>
                     <Link href="/loan-calculator" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Loan Calculator</Link>
                     <Link href="/first-gen" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">First-Gen Student</Link>
                     <Link href="/parent-guide" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Parent Guide</Link>
                   </div>
                 </div>
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Contact</Link>
                 {isAdmin && (
                   <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-bold text-red-400 py-3 border-b border-white/5 flex items-center justify-between">
                     <span>Admin Dashboard</span>
                     {pendingLeads > 0 && (
                       <span className="h-6 min-w-[24px] px-2 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                         {pendingLeads}
                       </span>
                     )}
                   </Link>
                 )}
                 <Link href="/profile" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">My Profile</Link>
                 <Button variant="destructive" className="w-full mt-6 h-12" onClick={handleSignOut}>
                   <LogOut size={18} className="mr-2" />
                   Logout
                 </Button>
               </>
             ) : (
               <>
                 <button onClick={() => handleNavClick("how-it-works")} className="text-left text-lg font-bold text-slate-300 py-3 border-b border-white/5">How it works</button>
                 <button onClick={() => handleNavClick("features")} className="text-left text-lg font-bold text-slate-300 py-3 border-b border-white/5">Features</button>
                 <Link href="/cutoff-calculator" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Cutoff Calculator</Link>
                 <div className="py-4 border-b border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">2026 Resources</p>
                   <div className="space-y-1">
                     <Link href="/nep-guide" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">NEP 2026 Guide</Link>
                     <Link href="/placements" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Placement Explorer</Link>
                     <Link href="/loan-calculator" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Loan Calculator</Link>
                     <Link href="/first-gen" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">First-Gen Student</Link>
                     <Link href="/parent-guide" onClick={() => setIsOpen(false)} className="block py-2 text-slate-400 hover:text-white">Parent Guide</Link>
                   </div>
                 </div>
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Contact</Link>
                 <div className="flex flex-col gap-3 pt-6">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="w-full"><Button variant="outline" className="w-full h-12">Login</Button></Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="w-full"><Button className="w-full h-12 bg-primary">Sign Up</Button></Link>
                 </div>
               </>
             )}
           </div>
        </div>
      )}
    </nav>
  );
}
