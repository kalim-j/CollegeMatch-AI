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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Logo from "./Logo";
import { isAdminEmail } from "@/lib/admin";

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
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

  return (
    <nav className={cn(
      "sticky top-0 z-[100] w-full border-b px-6 transition-all duration-300 flex items-center justify-between",
      scrolled 
        ? "bg-[var(--bg-card)] backdrop-blur-[16px] border-[var(--border-hover)] shadow-md shadow-purple-500/5 h-14" 
        : "bg-[var(--bg-card)] backdrop-blur-[24px] border-[var(--border-color)] shadow-sm h-16"
    )}>
      <Link href="/" className="hover:opacity-90 transition-opacity">
        <Logo />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        {!user ? (
          <>
            <button onClick={() => handleNavClick("how-it-works")} className="text-[13px] font-medium text-gray-500 hover:text-purple-600 transition-colors">How it works</button>
            <button onClick={() => handleNavClick("features")} className="text-[13px] font-medium text-gray-500 hover:text-purple-600 transition-colors">Features</button>
            <Link href="/cutoff-calculator" className="text-[13px] font-medium text-gray-500 hover:text-purple-600 transition-colors">Cutoff Calculator</Link>
            <Link href="/contact" className="text-[13px] font-medium text-gray-500 hover:text-purple-600 transition-colors">Contact</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/dashboard" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Dashboard</Link>
            
            <Link href="/interview" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/interview" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Find Colleges</Link>
            <Link href="/dashboard/compare" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/dashboard/compare" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Compare</Link>
            <Link href="/dashboard/predictor" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/dashboard/predictor" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Predictor</Link>
            <Link href="/colleges/map" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/colleges/map" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Map</Link>
            <Link href="/dashboard/scholarships" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/dashboard/scholarships" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Scholarships</Link>
            <Link href="/exams" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/exams" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Exams</Link>
            <Link href="/testimonial" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/testimonial" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Submit Review</Link>

            <Link href="/history" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/history" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>History</Link>
            <Link href="/contact" className={cn("text-[13px] font-medium transition-colors hover:text-purple-700", pathname === "/contact" ? "text-purple-700 border-b-2 border-purple-600 pb-1" : "text-gray-500")}>Contact</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {theme !== null && (
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-purple-100/80 hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-all dark:border-white/10 dark:hover:bg-white/5 dark:text-gray-400 dark:hover:text-purple-400"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-black uppercase tracking-wider relative">
                Admin
                {pendingLeads > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border border-purple-200">
                    {pendingLeads}
                  </span>
                )}
              </Link>
            )}
            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[12px] font-bold text-gray-800 dark:text-slate-200 leading-tight">{profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]}</span>
                <span className="text-[10px] text-gray-400 leading-tight">Student Profile</span>
              </div>
              <Avatar className="h-10 w-10 border border-purple-200 group-hover:border-purple-500 transition-all">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="bg-purple-50 text-purple-700 font-bold">
                  {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <button onClick={handleSignOut} className="hidden sm:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login" className="btn-ghost !py-2 !px-5 !text-[13px] !text-gray-700 !border-purple-200 hover:!bg-purple-50">Login</Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-[13px] !bg-purple-600 hover:!bg-purple-700">Get Started</Link>
          </div>
        )}

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-[var(--text-primary)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
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
