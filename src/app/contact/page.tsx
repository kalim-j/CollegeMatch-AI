"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Mail, Phone, MessageSquare, Instagram, Linkedin, Send, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      toast.success("Message sent successfully! Our expert will contact you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Talk to an Admission Expert</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Need personalized guidance? Our experts are here to help you navigate the complex world of college admissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="space-y-8">
          <Card className="rounded-[2rem] border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Email Us</p>
                    <a href="mailto:kalim.apoffi@gmail.com" className="text-xl font-medium hover:text-primary transition-colors">
                      kalim.apoffi@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Call Us</p>
                    <a href="tel:+919363554551" className="text-xl font-medium hover:text-secondary transition-colors">
                      +91 9363554551
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <a href="https://wa.me/919363554551" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#25D366] hover:bg-[#25D366]/90 rounded-xl px-6 gap-2 h-12">
                      <MessageSquare className="h-5 w-5" /> WhatsApp
                    </Button>
                  </a>
                  <a href="tel:+919363554551">
                    <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl px-6 gap-2 h-12">
                      <Phone className="h-5 w-5" /> Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="px-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Connect with us on social</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/_kalim07/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-14 w-14 rounded-2xl border-primary/20 hover:border-pink-500 hover:text-pink-500 transition-all p-0">
                  <Instagram className="h-7 w-7" />
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/kalim-j/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-14 w-14 rounded-2xl border-primary/20 hover:border-blue-600 hover:text-blue-600 transition-all p-0">
                  <Linkedin className="h-7 w-7" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="rounded-[2rem] border-primary/10 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8">
            <CardTitle className="text-2xl">Send a Message</CardTitle>
            <CardDescription>We'll get back to you within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">How can we help?</label>
                <textarea
                  className="w-full min-h-[150px] p-4 rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  placeholder="Tell us about your academic goals..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button disabled={loading} className="w-full h-14 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-bold gap-2">
                {loading ? "Sending..." : "Send Message"} <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
