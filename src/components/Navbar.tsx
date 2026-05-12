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

const ADMIN_EMAIL = "kalim.apoffi@gmail.com";

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLeads, setPendingLeads] = useState(0);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
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
    { name: "Scholarship Finder", href: "/scholarships", icon: Award },
    { name: "Entrance Exam Guide", href: "/exams", icon: Briefcase },
    { name: "Submit Review", href: "/testimonial", icon: MessageSquare },
  ];

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg font-bold text-lg">
            EA
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">EduAnalytics-AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {!user ? (
            <>
              <button onClick={() => handleNavClick("how-it-works")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</button>
              <button onClick={() => handleNavClick("features")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</button>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/dashboard" ? "text-primary" : "text-muted-foreground")}>Dashboard</Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary outline-none transition-colors">
                  Tools <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#111520] border-white/10 text-slate-300 w-56 p-2 rounded-2xl">
                  {tools.map((tool) => (
                    <DropdownMenuItem key={tool.href} asChild>
                      <Link href={tool.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                        <tool.icon size={18} className="text-primary" />
                        <span className="font-bold">{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/history" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/history" ? "text-primary" : "text-muted-foreground")}>History</Link>
              <Link href="/contact" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/contact" ? "text-primary" : "text-muted-foreground")}>Contact</Link>
              
              {isAdmin && (
                <Link href="/admin" className={cn("text-sm font-bold transition-all px-4 py-1.5 rounded-full relative", pathname === "/admin" ? "bg-red-500 text-white" : "text-red-400 bg-red-500/10 hover:bg-red-500/20")}>
                  Admin
                  {pendingLeads > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-[#111520]">
                      {pendingLeads}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary transition-all">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login"><Button variant="ghost" size="sm" className="font-bold">Login</Button></Link>
              <Link href="/register"><Button size="sm" className="bg-primary shadow-lg shadow-primary/20 font-black">Sign Up</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0d14]/95 backdrop-blur-2xl border-t border-white/5 p-6 space-y-6">
           <div className="flex flex-col gap-4">
             {user ? (
               <>
                 <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300">Dashboard</Link>
                 <div className="space-y-3 pt-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tools</p>
                   {tools.map(tool => (
                     <Link key={tool.href} href={tool.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-slate-400">
                        <tool.icon size={18} /> {tool.name}
                     </Link>
                   ))}
                 </div>
                 <Link href="/history" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300">History</Link>
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300">Contact</Link>
                 {isAdmin && <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-bold text-red-400">Admin Dashboard ({pendingLeads})</Link>}
                 <Link href="/profile" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300">My Profile</Link>
                 <Button variant="destructive" className="w-full mt-4" onClick={handleSignOut}>Logout</Button>
               </>
             ) : (
               <>
                 <button onClick={() => handleNavClick("how-it-works")} className="text-left text-lg font-bold text-slate-300">How it works</button>
                 <button onClick={() => handleNavClick("features")} className="text-left text-lg font-bold text-slate-300">Features</button>
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-300">Contact</Link>
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
