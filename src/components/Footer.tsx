import { Phone, Mail, MapPin, Instagram, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">
              EduAnalytics<span className="text-[#0F6E56]">-AI</span>
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering students with AI-driven insights to find their perfect college match in India. Your future, our expertise.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/interview" className="text-gray-400 hover:text-white transition-colors">AI Interview</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                +91 9363554551
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                info@eduanalytics.ai
              </li>
              <li className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                Chennai, Tamil Nadu, India
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Office Hours</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Mon – Sat: 9AM – 6PM IST</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} EduAnalytics-AI. All rights reserved.</p>
          <p className="font-medium text-primary/80">Inspiring ambition since 2024</p>
        </div>
      </div>
    </footer>
  );
}
