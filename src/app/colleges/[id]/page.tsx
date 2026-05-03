"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, CheckCircle, Phone, Globe, ShieldCheck, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function CollegeDetail() {
  const { id } = useParams();
  const router = useRouter();

  // In a real app, we'd fetch this college by ID from a global directory
  // For this demo, we'll show a generic but high-quality template

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-primary font-bold mb-12 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Suggestions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="h-64 bg-primary relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
              <div className="absolute -bottom-12 left-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <div className="pt-20 px-10 pb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Top Ranked</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Govt Institute</span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Indian Institute of Technology (IIT)</h1>
              <div className="flex items-center text-gray-500 font-medium mb-10">
                <MapPin className="h-5 w-5 mr-2 text-primary" /> New Delhi, India
              </div>

              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-6">
                  One of the most prestigious engineering institutions in India, known for its academic excellence and world-class faculty. It offers a wide range of undergraduate and postgraduate programs in engineering, science, and management.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center"><GraduationCap className="h-5 w-5 mr-2 text-primary" /> Key Highlights</h4>
                    <ul className="text-sm space-y-2">
                      <li>• 100% Placement Record</li>
                      <li>• Global Research Labs</li>
                      <li>• Innovation & Startup Hub</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center"><ShieldCheck className="h-5 w-5 mr-2 text-primary" /> Accreditation</h4>
                    <ul className="text-sm space-y-2">
                      <li>• NIRF Rank 1-5 Range</li>
                      <li>• NAAC A++ Grade</li>
                      <li>• AICTE Approved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/contact" className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                <Phone className="h-5 w-5" /> Book Consultation
              </Link>
              <button className="w-full bg-white text-gray-900 border-2 border-gray-100 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:border-primary/20 transition-all">
                <Globe className="h-5 w-5" /> Visit Website
              </button>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Admissions Note</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Admission to this institute is strictly based on national level entrance exams and merit scores. Ensure you have your documents ready for the counseling process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
