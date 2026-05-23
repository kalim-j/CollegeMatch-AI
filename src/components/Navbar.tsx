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
  Search, Award, MessageSquare, Briefcase
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

const ADMIN_EMAILS = ["kalim.apoffi@gmail.com", "kalimdon07@gmail.com"];

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLeads, setPendingLeads] = useState(0);

  useEffect(() => {
    if (user?.email && ADMIN_EMAILS.includes(user.email)) {
      const q = query(collection(db, "contacts"), where("status", "==", "new"));
      const unsub = onSnapshot(q, (snapshot) => {
        setPendingLeads(snapshot.size);
      });
      return () => unsub();
    }
  }, [user]);

  const handleSignOut = async () => {
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
    { name: "Cutoff Predictor", href: "/dashboard/predict", icon: TrendingUp },
    { name: "Scholarship Finder", href: "/scholarships", icon: Award },
    { name: "Entrance Exam Guide", href: "/exams", icon: Briefcase },
    { name: "Submit Review", href: "/testimonial", icon: MessageSquare },
  ];

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#05071a]/85 backdrop-blur-[24px] px-6 h-16 flex items-center justify-between">
      <Link href="/" className="hover:opacity-90 transition-opacity">
        <Logo />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        {!user ? (
          <>
            <button onClick={() => handleNavClick("how-it-works")} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">How it works</button>
            <button onClick={() => handleNavClick("features")} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">Features</button>
            <Link href="/contact" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">Contact</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={cn("text-[13px] font-medium transition-colors hover:text-white", pathname === "/dashboard" ? "text-white border-b-2 border-[#7F77DD] pb-1" : "text-white/60")}>Dashboard</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-[13px] font-medium text-white/60 hover:text-white outline-none transition-colors">
                Tools <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#111520] border-white/10 text-slate-300 w-64 p-2 rounded-2xl backdrop-blur-xl shadow-2xl">
                {tools.map((tool) => (
                  <DropdownMenuItem key={tool.href} asChild>
                    <Link href={tool.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <tool.icon size={16} />
                      </div>
                      <span className="font-bold text-sm">{tool.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/history" className={cn("text-[13px] font-medium transition-colors hover:text-white", pathname === "/history" ? "text-white border-b-2 border-[#7F77DD] pb-1" : "text-white/60")}>History</Link>
            <Link href="/contact" className={cn("text-[13px] font-medium transition-colors hover:text-white", pathname === "/contact" ? "text-white border-b-2 border-[#7F77DD] pb-1" : "text-white/60")}>Contact</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider relative">
                Admin
                {pendingLeads > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border border-[#05071a]">
                    {pendingLeads}
                  </span>
                )}
              </Link>
            )}
            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[12px] font-bold text-white leading-tight">{profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]}</span>
                <span className="text-[10px] text-white/40 leading-tight">Student Profile</span>
              </div>
              <Avatar className="h-10 w-10 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-bold">
                  {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <button onClick={handleSignOut} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost !py-2 !px-5 !text-[13px]">Login</Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-[13px]">Get Started</Link>
          </div>
        )}

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
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
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300 py-3 border-b border-white/5">Contact</Link>
                 <div className="flex flex-col gap-3 pt-6">
                    <Link href="/login" className="w-full"><Button variant="outline" className="w-full h-12">Login</Button></Link>
                    <Link href="/register" className="w-full"><Button className="w-full h-12 bg-primary">Sign Up</Button></Link>
                 </div>
               </>
             )}
           </div>
        </div>
      )}
    </nav>
  );
}
