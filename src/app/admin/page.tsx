"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  LayoutDashboard, Users, MessageSquare, Star, 
  Search, Filter, Calendar, MapPin, Phone, 
  ExternalLink, CheckCircle2, XCircle, Clock, 
  ChevronRight, Loader2, LogOut, MoreVertical,
  Briefcase, GraduationCap, MessageCircle,
  FileText, Check, Trash2, BadgeAlert
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, query, orderBy, where, 
  updateDoc, doc, deleteDoc, serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ["kalim.apoffi@gmail.com", "kalimdon07@gmail.com"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/dashboard");
        return;
      }
      
      // Real-time listeners
      const leadsUnsub = onSnapshot(
        query(collection(db, "contacts"), orderBy("createdAt", "desc")),
        (snapshot) => {
          setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (error) => {
          console.error("Leads Sync Error:", error);
          setLoading(false);
        }
      );

      const testUnsub = onSnapshot(
        query(collection(db, "testimonials"), orderBy("createdAt", "desc")),
        (snapshot) => {
          setTestimonials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (error) => {
          console.error("Testimonials Sync Error:", error);
        }
      );

      return () => {
        leadsUnsub();
        testUnsub();
      };
    }
  }, [user, authLoading, router]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "contacts", leadId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success("Status updated to " + newStatus);
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      await updateDoc(doc(db, "contacts", leadId), {
        notes: notes,
        updatedAt: serverTimestamp()
      });
      toast.success("Notes saved");
    } catch (error: any) {
      toast.error("Failed to save notes");
    }
  };

  const approveTestimonial = async (id: string) => {
    try {
      await updateDoc(doc(db, "testimonials", id), { approved: true });
      toast.success("Testimonial approved!");
    } catch (error: any) {
      toast.error("Failed to approve");
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
      toast.success("Testimonial deleted");
    } catch (error: any) {
      toast.error("Failed to delete");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      interested: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      admitted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      not_interested: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", styles[status || "new"]);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         l.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingTestimonials = testimonials.filter(t => !t.approved);

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0d14]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-300 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#111520] flex flex-col fixed h-full z-30">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-500/20">
              CM
            </div>
            <span className="text-2xl font-black text-white font-syne tracking-tight">CollegeMatch Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <button
            onClick={() => setActiveTab("leads")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all relative group",
              activeTab === "leads" ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
            )}
          >
            <Users size={20} />
            <span>Lead Management</span>
            {leads.filter(l => l.status === "new").length > 0 && (
              <span className="absolute right-4 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {leads.filter(l => l.status === "new").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("testimonials")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all relative group",
              activeTab === "testimonials" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
            )}
          >
            <Star size={20} />
            <span>Testimonials</span>
            {pendingTestimonials.length > 0 && (
              <span className="absolute right-4 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                {pendingTestimonials.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center font-black text-white">K</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Kalim Admin</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-12 lg:p-16 space-y-12">
          {/* Header */}
          <header className="flex justify-between items-center border-b border-white/5 pb-10">
            <div>
              <h1 className="text-6xl font-black text-white font-syne tracking-tighter capitalize">{activeTab}</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.4em] mt-2">CollegeMatch-AI Lead Intelligence</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-80 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-red-500 transition-all font-bold"
                />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "leads" && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: "Total Leads", val: leads.length, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "New (Pending)", val: leads.filter(l => l.status === "new").length, color: "text-red-400", bg: "bg-red-500/10" },
                    { label: "Contacted", val: leads.filter(l => l.status === "contacted").length, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Admitted", val: leads.filter(l => l.status === "admitted").length, color: "text-emerald-400", bg: "bg-emerald-500/10" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111520] border border-white/5 rounded-[2rem] p-8 shadow-xl">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={cn("text-4xl font-black tabular-nums", stat.color)}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
                          <th className="px-8 py-6">Student Info</th>
                          <th className="px-8 py-6">Stream & Level</th>
                          <th className="px-8 py-6">Message Preview</th>
                          <th className="px-8 py-6">Status</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-white leading-tight">{lead.name}</span>
                                <span className="text-xs text-slate-500 font-bold">{lead.email}</span>
                                <span className="text-[10px] text-slate-600 font-mono mt-1">{lead.phone}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Briefcase size={12} /> {lead.stream}</span>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{lead.level} | {lead.state}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-xs text-slate-500 max-w-xs truncate italic">
                                &quot;{lead.message}&quot;
                              </p>
                              <span className="text-[9px] text-slate-600 font-bold block mt-1">{lead.createdAt?.toDate()?.toLocaleString() || "No Date"}</span>
                            </td>
                            <td className="px-8 py-6">
                               <select 
                                 value={lead.status || "new"}
                                 onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                 className={cn("bg-transparent outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer", getStatusBadge(lead.status))}
                               >
                                 <option value="new" className="bg-[#111520]">New</option>
                                 <option value="contacted" className="bg-[#111520]">Contacted</option>
                                 <option value="interested" className="bg-[#111520]">Interested</option>
                                 <option value="admitted" className="bg-[#111520]">Admitted</option>
                                 <option value="not_interested" className="bg-[#111520]">Not Interested</option>
                               </select>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <a href={`tel:${lead.phone}`} className="h-10 w-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg"><Phone size={18} /></a>
                                <a 
                                  href={`https://wa.me/91${lead.phone}?text=Hi+${encodeURIComponent(lead.name)},+this+is+CollegeMatch-AI+admission+team.+We+received+your+enquiry+about+${encodeURIComponent(lead.stream)}+admissions.+How+can+we+help+you+today?`} 
                                  target="_blank"
                                  className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                >
                                  <MessageCircle size={18} />
                                </a>
                                <button 
                                  onClick={() => setSelectedLead(lead)}
                                  className="h-10 w-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                                >
                                  <FileText size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "testimonials" && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
                          <th className="px-8 py-6">Student</th>
                          <th className="px-8 py-6">College & Review</th>
                          <th className="px-8 py-6">Rating</th>
                          <th className="px-8 py-6">Status</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {testimonials.map((t) => (
                          <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/20 flex items-center justify-center font-black text-amber-400">
                                  {t.name?.[0] || "U"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white">{t.name}</span>
                                  <span className="text-[10px] text-slate-600 font-bold">{t.location}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{t.college} | {t.stream} ({t.year})</span>
                                <p className="text-sm text-slate-400 max-w-md leading-relaxed italic">&quot;{t.review}&quot;</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={cn("fill-current", i < t.rating ? "text-amber-400" : "text-slate-800")} />
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               {t.approved ? (
                                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">Live</span>
                               ) : (
                                 <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                               )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                {!t.approved && (
                                  <button 
                                    onClick={() => approveTestimonial(t.id)}
                                    className="h-10 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteTestimonial(t.id)}
                                  className="h-10 w-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-xl bg-[#111520] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <h2 className="text-2xl font-black text-white font-syne uppercase tracking-widest">Lead Intelligence Profile</h2>
                 <button onClick={() => setSelectedLead(null)} className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-all"><XCircle /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-4xl font-black text-white tracking-tighter">{selectedLead.name}</h3>
                         <p className="text-red-400 font-bold text-lg">{selectedLead.email}</p>
                      </div>
                      <div className={cn("text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-2xl", getStatusBadge(selectedLead.status))}>
                        {selectedLead.status || "New"}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic Stream</p>
                         <p className="font-bold text-white flex items-center gap-2"><Briefcase className="text-red-500" size={16} /> {selectedLead.stream}</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Course Level</p>
                         <p className="font-bold text-white flex items-center gap-2"><GraduationCap className="text-red-500" size={16} /> {selectedLead.level}</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
                         <p className="font-bold text-white flex items-center gap-2"><MapPin className="text-red-500" size={16} /> {selectedLead.state}</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cutoff Score</p>
                         <p className="font-black text-2xl text-red-400">{selectedLead.cutoff || "N/A"}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Student Inquiry</h4>
                  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 text-slate-300 leading-relaxed font-medium italic">
                    &quot;{selectedLead.message}&quot;
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Admin Intelligence Notes</h4>
                   <textarea 
                     defaultValue={selectedLead.notes}
                     onBlur={(e) => updateLeadNotes(selectedLead.id, e.target.value)}
                     placeholder="Type lead intelligence notes here (auto-saves on blur)..."
                     className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white outline-none focus:border-red-500 transition-all resize-none font-medium text-sm"
                   />
                </div>

                <div className="pt-6 border-t border-white/5">
                   <div className="flex flex-col gap-4">
                      <a 
                        href={`tel:${selectedLead.phone}`}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all"
                      >
                        <Phone size={20} /> Call Now: {selectedLead.phone}
                      </a>
                      <a 
                        href={`https://wa.me/91${selectedLead.phone}?text=Hi+${encodeURIComponent(selectedLead.name)},+this+is+CollegeMatch-AI+admission+team.+We+received+your+enquiry+about+${encodeURIComponent(selectedLead.stream)}+admissions.+How+can+we+help+you+today?`} 
                        target="_blank"
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all"
                      >
                        <MessageCircle size={20} /> Open WhatsApp Chat
                      </a>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
