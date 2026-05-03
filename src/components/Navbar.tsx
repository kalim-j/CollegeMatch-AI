"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, User, Menu, X, LayoutDashboard, History, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary tracking-tight">
                EduAnalytics<span className="text-gray-900">-AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-primary font-medium transition-colors">Home</Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary font-medium transition-colors">Contact</Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors">Dashboard</Link>
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-red-600 font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-primary font-medium">Login</Link>
                <Link 
                  href="/register" 
                  className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-4">
          <Link href="/" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/contact" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/history" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>History</Link>
              <Link href="/profile" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Login</Link>
              <Link href="/register" className="block bg-primary text-white text-center py-2 rounded-lg" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
