"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  Menu, X, ChevronDown, LogOut, Sun, Moon, Bell, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { isAdminEmail } from "@/lib/admin";
import { useTheme } from "next-themes";
import { t, setLanguage } from "@/lib/i18n";

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [notificationCount, setNotificationCount] = useState(2);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en'|'ta'>('en');

  useEffect(() => {
    setMounted(true);
    const savedLang = (localStorage.getItem('lang') as 'en'|'ta') || 'en';
    setCurrentLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const currentTheme = resolvedTheme;
    const next = currentTheme === "light" ? "dark" : "light";
    setTheme(next);
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ta' : 'en';
    if (typeof setLanguage === 'function') {
        setLanguage(nextLang);
    }
    setCurrentLang(nextLang);
    window.location.reload();
  };

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

  const isAdmin = isAdminEmail(user?.email);

  // BUG 1 fix: All navbar colors must use isDark conditional
  const isDark = mounted && resolvedTheme === "dark";

  const tools = [
    { name: "Find colleges", href: "/interview" },
    { name: "Scholarship finder", href: "/scholarships" },
    { name: "Exam guide", href: "/exams" },
    { name: "Cutoff calculator", href: "/cutoff-calculator" },
    { name: "Study planner", href: "/study-planner" },
    { name: "Mock interview", href: "/mock-interview" },
    { name: "Resume builder", href: "/resume" },
    { name: "SOP generator", href: "/sop" },
    { name: "Doubt solver", href: "/doubt-solver" },
    { name: "Career explorer", href: "/career-explorer" },
    { name: "Fee calculator", href: "/fee-calculator" },
    { name: "Cutoff trends", href: "/cutoff-trends" },
    { name: "Document checklist", href: "/documents" }
  ];

  const resources = [
    { name: "NEP 2026 guide", href: "/nep-guide" },
    { name: "Placements explorer", href: "/placements" },
    { name: "College map", href: "/colleges/map" },
    { name: "First gen guide", href: "/first-gen" },
    { name: "Parent guide", href: "/parent-guide" },
    { name: "2026 exam calendar", href: "/exam-calendar" }
  ];

  const mainLinks = user ? [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Learning", href: "/learning" },
    { name: "Colleges", href: "/interview" },
    { name: "Compare", href: "/dashboard/compare" },
    { name: "Predictor", href: "/dashboard/predictor" },
    { name: "Community", href: "/community" },
    { name: "Contact", href: "/contact" }
  ] : [
    { name: "How it works", href: "/#how-it-works" },
    { name: "Features", href: "/#features" },
    { name: "Contact", href: "/contact" }
  ];

  // ── 2. RENDER THEME ──
  if (!mounted) return null;

  // Hide Navbar on auth pages
  if (['/login', '/register', '/verify-otp'].includes(pathname)) {
    return null;
  }

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
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
      background: isDark ? 'rgba(5,7,26,0.92)' : 'rgba(255,255,255,0.92)',
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
      <div className="hidden lg:flex" style={{ display:'flex', alignItems:'center', gap:'16px', flex:1, justifyContent:'center' }}>
        {mainLinks.map(link => {
          if (link.name === "Community" || link.name === "Contact") return null; // We'll put them after dropdowns
          return (
            <Link key={link.name} href={link.href} style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: pathname === link.href ? (isDark ? 'white' : '#534AB7') : (isDark ? 'rgba(255,255,255,0.70)' : '#4a4370'), fontWeight: pathname === link.href ? 600 : 400, borderBottom: pathname === link.href ? '2px solid #7F77DD' : 'none' }}>
              {link.name}
            </Link>
          );
        })}

        {user && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Tools <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-[#0a0d14] border-gray-200 dark:border-white/10 mt-2 z-[200] max-h-96 overflow-y-auto">
                {tools.map(tool => (
                  <DropdownMenuItem key={tool.name} asChild>
                    <Link href={tool.href} className="cursor-pointer w-full">{tool.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: isDark ? 'rgba(255,255,255,0.70)' : '#4a4370', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Resources <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-[#0a0d14] border-gray-200 dark:border-white/10 mt-2 z-[200]">
                {resources.map(res => (
                  <DropdownMenuItem key={res.name} asChild>
                    <Link href={res.href} className="cursor-pointer w-full">{res.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/community" style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: pathname.startsWith('/community') ? (isDark ? 'white' : '#534AB7') : (isDark ? 'rgba(255,255,255,0.70)' : '#4a4370'), fontWeight: pathname.startsWith('/community') ? 600 : 400 }}>Community</Link>
          </  >
        )}
        <Link href="/contact" style={{ fontSize:'13px', padding:'6px 10px', whiteSpace:'nowrap', color: pathname === '/contact' ? (isDark ? 'white' : '#534AB7') : (isDark ? 'rgba(255,255,255,0.70)' : '#4a4370'), fontWeight: pathname === '/contact' ? 600 : 400 }}>Contact</Link>
      </div>

      {/* RIGHT — Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
        {mounted && (
          <button onClick={toggleLanguage} style={{ fontSize:'12px', fontWeight:600, color: isDark ? 'rgba(255,255,255,0.7)' : '#4a4370', background: 'none', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', gap:'4px' }} aria-label="Toggle language">
            <Globe size={14} />
            {currentLang === 'en' ? 'EN' : 'தமிழ்'}
          </button>
        )}
        
        {mounted && (
          <button onClick={toggleTheme} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color: isDark ? 'rgba(255,255,255,0.7)' : '#4a4370', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Toggle theme">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        )}

        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <DropdownMenu>
              <DropdownMenuTrigger style={{ position:'relative', color: isDark ? 'rgba(255,255,255,0.7)' : '#4a4370', background: 'none', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32 }}>
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span style={{ position:'absolute', top:2, right:4, width:8, height:8, backgroundColor:'#ef4444', borderRadius:'50%' }}></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-[#0a0d14] border-gray-200 dark:border-white/10 mt-2 z-[200] w-64 p-2">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 border-b dark:border-white/10 pb-2">Notifications</div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm border border-indigo-100 dark:border-indigo-900/30">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Anna Univ Counseling</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">TNEA Rank List published.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">AI Predictor</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Your profile matches 5 new colleges.</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', lineHeight: 1 }}>
                  {((profile as any)?.name || profile?.fullName || user.displayName || user.email)?.split(' ')[0].split('@')[0]}
                </span>
              </div>
              <Avatar style={{ width: 32, height: 32, flexShrink: 0, border: '1px solid rgba(127,119,221,0.3)' }}>
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback style={{ background: 'rgba(127,119,221,0.1)', color: '#7F77DD', fontSize: 12, fontWeight: 700 }}>
                  {((profile as any)?.name || profile?.fullName || user.displayName || user.email)?.charAt(0).toUpperCase()}
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
                         <span className="font-medium">{tool.name}</span>
                       </Link>
                     ))}
                   </div>
                 </div>
                 
                 <div className="py-4 border-b border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Resources</p>
                   <div className="space-y-1">
                     {resources.map(res => (
                       <Link 
                         key={res.href} 
                         href={res.href} 
                         onClick={() => setIsOpen(false)} 
                         className="flex items-center gap-3 text-slate-400 hover:text-white py-3 px-3 rounded-lg hover:bg-white/5 transition-all"
                       >
                         <span className="font-medium">{res.name}</span>
                       </Link>
                     ))}
                   </div>
                 </div>
                 
                 <Link href="/community" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Community</Link>
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
                 {mainLinks.map(link => (
                   <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="block text-lg font-bold text-slate-300 py-3 border-b border-white/5">
                     {link.name}
                   </Link>
                 ))}
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
