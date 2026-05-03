"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, Loader2, CheckCircle, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-primary pt-24 pb-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Talk to an Admission Expert</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Have questions? Our team of experienced counselors is here to guide you through every step of your admission journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 -mt-24 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Details</h3>
              
              <div className="space-y-8">
                <a href="tel:+919363554551" className="flex items-start group">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary mr-5 group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Call Us</span>
                    <span className="text-lg font-bold text-gray-900">+91 9363554551</span>
                  </div>
                </a>

                <a href="https://wa.me/919363554551" target="_blank" className="flex items-start group">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-600 mr-5 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">WhatsApp</span>
                    <span className="text-lg font-bold text-gray-900">Chat with Expert</span>
                  </div>
                </a>

                <div className="flex items-start">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 mr-5">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Availability</span>
                    <span className="text-lg font-bold text-gray-900">Mon–Sat, 9AM–6PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <Mail className="h-32 w-32" />
              </div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Direct Email</h3>
              <p className="text-gray-400 mb-6 relative z-10">Prefer writing? Send us an email and we'll get back to you within 24 hours.</p>
              <a href="mailto:info@eduanalytics.ai" className="text-primary font-bold text-lg relative z-10 hover:underline">info@eduanalytics.ai</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 h-full">
              {success ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                  <p className="text-gray-500 text-lg max-w-md">Thank you for reaching out. One of our admission experts will contact you shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-10 text-primary font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-gray-900 mb-10">Send a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Your Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="John Doe"
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="john@example.com"
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Tell us how we can help you..."
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-lg"
                    >
                      {loading ? (
                        <>Sending... <Loader2 className="h-6 w-6 animate-spin" /></>
                      ) : (
                        <>Send Message <Send className="h-5 w-5" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
