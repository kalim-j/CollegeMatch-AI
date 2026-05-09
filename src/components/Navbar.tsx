"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { GraduationCap, LayoutDashboard, History, User, Phone, LogOut, Menu, X, Zap, Sparkles, ArrowLeftRight, TrendingUp, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
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

  const navLinks = [
    { name: "How it works", id: "how-it-works", icon: Sparkles, protected: false },
    { name: "Features", id: "features", icon: Zap, protected: false },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, protected: true },
    { name: "Compare", href: "/dashboard/compare", icon: ArrowLeftRight, protected: true },
    { name: "Trends", href: "/dashboard/trends", icon: TrendingUp, protected: true },
    { name: "History", href: "/history", icon: History, protected: true },
    { name: "Contact", href: "/contact", icon: Phone, protected: false },
    { name: "Admin", href: "/admin", icon: Settings, protected: true, adminOnly: true },
    { name: "Profile", href: "/profile", icon: User, protected: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (user) {
      // Logged in: Hide 'How it works' and 'Features'
      if (link.adminOnly && user.email !== "kalimdon07@gmail.com") return false;
      return link.protected || link.name === "Contact";
    }
    // Logged out: Hide protected links (Dashboard, History, Profile)
    if (link.adminOnly) return false;
    return !link.protected;
  });

  const isPageHidden = pathname === "/admin";

  if (isPageHidden) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg font-bold text-lg">
            CM
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">CollegeMatch-AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {filteredLinks.map((link) => (
            link.id ? (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id!)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            )
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary shadow-md hover:shadow-lg transition-all">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/60 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {filteredLinks.map((link) => (
              link.id ? (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id!)}
                  className={cn(
                    "flex items-center gap-3 py-2 text-base font-medium transition-colors hover:text-primary w-full text-left text-muted-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2 text-base font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              )
            ))}
            {user ? (
              <Button variant="destructive" size="sm" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
