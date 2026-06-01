"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Star, Search,
  MapPin, Phone, XCircle, Loader2,
  Briefcase, GraduationCap, MessageCircle,
  FileText, Trash2, MessageSquare, Activity, History
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, query, orderBy,
  updateDoc, doc, deleteDoc, serverTimestamp, onSnapshot, getDocs, limit
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const ADMIN_EMAILS = ["kalim.apoffi@gmail.com", "kalimdon07@gmail.com"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPredictions, setUserPredictions] = useState<any[]>([]);
  const [userScholarships, setUserScholarships] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const loadUserActivity = async (userId: string) => {
    setLoadingActivity(true);
    try {
      const predSnap = await getDocs(
        query(collection(db, "interviews", userId, "sessions"), orderBy("timestamp", "desc"), limit(15))
      );
      setUserPredictions(predSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const scholSnap = await getDocs(
        query(collection(db, "scholarships", userId, "searches"), orderBy("timestamp", "desc"), limit(15))
      );
      setUserScholarships(scholSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load user activity:", err);
      toast.error("Failed to load activity logs");
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadUserActivity(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/dashboard");
        return;
      }
      const leadsUnsub = onSnapshot(
        query(collection(db, "contacts"), orderBy("createdAt", "desc")),
        (snap) => { setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
        () => { toast.error("Leads permission denied"); setLoading(false); }
      );
      const testUnsub = onSnapshot(
        query(collection(db, "testimonials"), orderBy("createdAt", "desc")),
        (snap) => setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        () => toast.error("Testimonials permission denied")
      );
      const usersUnsub = onSnapshot(
        collection(db, "users"),
        (snap) => setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        () => toast.error("Users permission denied")
      );
      return () => { leadsUnsub(); testUnsub(); usersUnsub(); };
    }
  }, [user, authLoading, router]);

  const updateLeadStatus = async (id: string, status: string) => {
    try { await updateDoc(doc(db, "contacts", id), { status, updatedAt: serverTimestamp() }); toast.success("Status updated"); }
    catch { toast.error("Failed to update status"); }
  };
  const updateLeadNotes = async (id: string, notes: string) => {
    try { await updateDoc(doc(db, "contacts", id), { notes, updatedAt: serverTimestamp() }); toast.success("Notes saved"); }
    catch { toast.error("Failed to save notes"); }
  };
  const approveTestimonial = async (id: string) => {
    try { await updateDoc(doc(db, "testimonials", id), { approved: true }); toast.success("Testimonial approved!"); }
    catch { toast.error("Failed to approve"); }
  };
  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try { await deleteDoc(doc(db, "testimonials", id)); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const statusStyles: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    interested: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    admitted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    not_interested: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  const getStatusClass = (s: string) => cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", statusStyles[s || "new"]);

  const filteredLeads = leads.filter(l =>
    (l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const pendingCount = testimonials.filter(t => !t.approved).length;
  const newLeadsCount = leads.filter(l => l.status === "new").length;

  const navItems = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard, accent: "indigo" },
    { id: "leads", label: "Lead Management", icon: Users, accent: "blue", badge: newLeadsCount },
    { id: "testimonials", label: "Testimonials", icon: Star, accent: "amber", badge: pendingCount },
    { id: "activity", label: "User Activity", icon: Activity, accent: "teal" },
  ];

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#05071a]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Loading Admin Console…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white flex">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col sticky top-16 h-[calc(100vh-64px)] z-30 flex-shrink-0">
        <div className="p-8 border-b border-white/5">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">Admin Command Center</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all relative text-left",
                activeTab === item.id
                  ? `bg-${item.accent}-500/10 text-${item.accent}-400 border border-${item.accent}-500/20`
                  : "hover:bg-white/5 text-white/30 hover:text-white/60"
              )}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute right-4 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-sm">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Admin</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative z-10">
        <div className="max-w-[1400px] mx-auto p-10 space-y-10">
          {/* Header */}
          <header className="flex justify-between items-end border-b border-white/5 pb-8">
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">CollegeMatch-AI</p>
              <h1 className="text-5xl font-black text-white tracking-tighter capitalize">{activeTab}</h1>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                placeholder="Search leads…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-72 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium text-sm placeholder:text-white/20"
              />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Users", value: usersList.length, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                    { label: "Total Leads", value: leads.length, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Live Users", value: usersList.filter(u => u.isOnline).length, icon: LayoutDashboard, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
                  ].map((stat, i) => (
                    <div key={i} className={`rounded-[2rem] p-8 border ${stat.border} bg-white/[0.03] backdrop-blur-sm space-y-4`}>
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                        <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={stat.color} size={18} />
                        </div>
                      </div>
                      <p className={`text-5xl font-black tabular-nums ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] overflow-hidden">
                  <div className="p-8 border-b border-white/5">
                    <h3 className="text-lg font-black text-white">Recent Signups</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {usersList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-indigo-500/20 text-indigo-400 font-black rounded-xl flex items-center justify-center text-sm uppercase">
                            {u.fullName?.[0] || u.email?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.fullName || "Anonymous"}</p>
                            <p className="text-[11px] text-white/30">{u.email}</p>
                          </div>
                        </div>
                        {u.isOnline
                          ? <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-teal-500/20">Live</span>
                          : <span className="text-[11px] font-bold text-white/20">{u.lastActive?.toDate()?.toLocaleDateString() || "Offline"}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* LEADS TAB */}
            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: "Total", value: leads.length, color: "text-blue-400" },
                    { label: "New", value: newLeadsCount, color: "text-red-400" },
                    { label: "Contacted", value: leads.filter(l => l.status === "contacted").length, color: "text-amber-400" },
                    { label: "Admitted", value: leads.filter(l => l.status === "admitted").length, color: "text-teal-400" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-6 border border-white/5 bg-white/[0.03]">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">{s.label}</p>
                      <p className={`text-4xl font-black tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/[0.02]">
                          <th className="px-8 py-5">Student</th>
                          <th className="px-8 py-5">Stream</th>
                          <th className="px-8 py-5">Message</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLeads.map(lead => (
                          <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5">
                              <p className="font-bold text-white text-sm">{lead.name}</p>
                              <p className="text-[11px] text-white/30">{lead.email}</p>
                              <p className="text-[11px] text-white/20 font-mono">{lead.phone}</p>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm font-bold text-white/60 flex items-center gap-1"><Briefcase size={12} className="text-indigo-400" /> {lead.stream}</p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{lead.level} · {lead.state}</p>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-[12px] text-white/40 max-w-xs truncate italic">"{lead.message}"</p>
                              <p className="text-[10px] text-white/20 mt-1">{lead.createdAt?.toDate()?.toLocaleString() || "—"}</p>
                            </td>
                            <td className="px-8 py-5">
                              <select
                                value={lead.status || "new"}
                                onChange={e => updateLeadStatus(lead.id, e.target.value)}
                                className={cn("bg-transparent outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-full px-3 py-1 border", statusStyles[lead.status || "new"])}
                              >
                                <option value="new" className="bg-[#05071a]">New</option>
                                <option value="contacted" className="bg-[#05071a]">Contacted</option>
                                <option value="interested" className="bg-[#05071a]">Interested</option>
                                <option value="admitted" className="bg-[#05071a]">Admitted</option>
                                <option value="not_interested" className="bg-[#05071a]">Not Interested</option>
                              </select>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex justify-end gap-2">
                                <a href={`tel:${lead.phone}`} className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Phone size={15} /></a>
                                <a href={`https://wa.me/91${lead.phone}?text=Hi+${encodeURIComponent(lead.name)},+CollegeMatch-AI+team+here.`} target="_blank" className="h-9 w-9 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"><MessageCircle size={15} /></a>
                                <button onClick={() => setSelectedLead(lead)} className="h-9 w-9 bg-white/5 text-white/40 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"><FileText size={15} /></button>
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

            {/* TESTIMONIALS TAB */}
            {activeTab === "testimonials" && (
              <motion.div key="testimonials" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/[0.02]">
                          <th className="px-8 py-5">Student</th>
                          <th className="px-8 py-5">Review</th>
                          <th className="px-8 py-5">Rating</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {testimonials.map(t => (
                          <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center font-black text-amber-400 text-sm">{t.name?.[0] || "U"}</div>
                                <div>
                                  <p className="font-bold text-white text-sm">{t.name}</p>
                                  <p className="text-[10px] text-white/30">{t.location}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">{t.college} · {t.stream} ({t.year})</p>
                              <p className="text-sm text-white/40 max-w-sm italic">"{t.review}"</p>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={cn("fill-current", i < t.rating ? "text-amber-400" : "text-white/10")} />
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              {t.approved
                                ? <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-[10px] font-black uppercase">Live</span>
                                : <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase">Pending</span>
                              }
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex justify-end gap-2">
                                {!t.approved && (
                                  <button onClick={() => approveTestimonial(t.id)} className="h-9 px-4 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl hover:bg-teal-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Approve</button>
                                )}
                                <button onClick={() => deleteTestimonial(t.id)} className="h-9 w-9 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><Trash2 size={15} /></button>
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

            {/* USER ACTIVITY TAB */}
            {activeTab === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Users list */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 space-y-4">
                      <h3 className="text-lg font-black text-white">Registered Users</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Select a user to view their search activity</p>
                      
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {usersList.map(u => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                              selectedUser?.id === u.id
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                                : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-white/70"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-teal-500/20 text-teal-400 font-black rounded-xl flex items-center justify-center text-xs uppercase">
                                {u.fullName?.[0] || u.email?.[0] || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{u.fullName || "Anonymous"}</p>
                                <p className="text-[10px] text-white/30 truncate">{u.email}</p>
                              </div>
                            </div>
                            {u.isOnline ? (
                              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                            ) : (
                              <span className="text-[9px] font-bold text-white/20 shrink-0">Offline</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected User Activity Logs */}
                  <div className="lg:col-span-2 space-y-6">
                    {selectedUser ? (
                      <div className="space-y-6">
                        {/* User Summary Header */}
                        <div className="rounded-[2.5rem] border border-teal-500/20 bg-teal-500/[0.02] p-8 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Active Profile</p>
                            <h3 className="text-2xl font-black text-white">{selectedUser.fullName || "Anonymous"}</h3>
                            <p className="text-sm text-white/40">{selectedUser.email}</p>
                            {selectedUser.lastActive && (
                              <p className="text-[10px] text-white/20 mt-1">
                                Last Active: {selectedUser.lastActive?.toDate ? selectedUser.lastActive.toDate().toLocaleString() : new Date(selectedUser.lastActive).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {selectedUser.isOnline ? (
                              <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Live Now</span>
                            ) : (
                              <span className="px-3 py-1 bg-white/5 text-white/30 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">Offline</span>
                            )}
                          </div>
                        </div>

                        {loadingActivity ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Retrieving User Activity Logs…</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Predictions history */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap size={16} className="text-indigo-400" /> College Predictions ({userPredictions.length})
                              </h4>
                              {userPredictions.length > 0 ? (
                                <div className="space-y-3">
                                  {userPredictions.map((pred, i) => (
                                    <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:border-indigo-500/20 transition-all">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-xs font-bold text-white">{pred.studentProfile?.stream || "General"}</p>
                                          <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{pred.studentProfile?.courseLevel} · {pred.studentProfile?.state}</p>
                                        </div>
                                        {pred.rating ? (
                                          <span className="text-xs py-0.5 px-2 bg-white/5 rounded-full" title={`User rated matches: ${pred.rating}`}>
                                            {pred.rating === "happy" ? "😊 Happy" : "😢 Bad"}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-white/20 font-bold uppercase">Unrated</span>
                                        )}
                                      </div>
                                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] space-y-1">
                                        <p className="text-white/60"><span className="text-white/30">Top Match:</span> {pred.topCollege || "Unknown"}</p>
                                        <p className="text-white/60"><span className="text-white/30">Results:</span> {pred.totalResults || 0} colleges found</p>
                                        {pred.studentProfile?.cutoffMark && (
                                          <p className="text-white/60"><span className="text-white/30">Cutoff:</span> {pred.studentProfile.cutoffMark}</p>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-white/20 font-mono text-right">
                                        {pred.timestamp?.toDate ? pred.timestamp.toDate().toLocaleString() : new Date(pred.createdAt || "").toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-white/5 p-8 text-center text-white/20 text-xs">
                                  No college predictions found.
                                </div>
                              )}
                            </div>

                            {/* Scholarship searches */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Activity size={16} className="text-teal-400" /> Scholarship Finder ({userScholarships.length})
                              </h4>
                              {userScholarships.length > 0 ? (
                                <div className="space-y-3">
                                  {userScholarships.map((schol, i) => (
                                    <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:border-teal-500/20 transition-all">
                                      <div>
                                        <p className="text-xs font-bold text-white">{schol.studentData?.stream || "General"}</p>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{schol.studentData?.level} · {schol.studentData?.state}</p>
                                      </div>
                                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] space-y-1">
                                        <p className="text-white/60"><span className="text-white/30">Community:</span> {schol.studentData?.community}</p>
                                        <p className="text-white/60"><span className="text-white/30">Income:</span> {schol.studentData?.income}</p>
                                        <p className="text-white/60"><span className="text-white/30">Percentage:</span> {schol.studentData?.percentage}%</p>
                                      </div>
                                      <p className="text-[9px] text-white/20 font-mono text-right">
                                        {schol.timestamp?.toDate ? schol.timestamp.toDate().toLocaleString() : "—"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-white/5 p-8 text-center text-white/20 text-xs">
                                  No scholarship searches found.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] py-32 space-y-4">
                        <Activity className="h-16 w-16 text-white/10 animate-pulse" />
                        <div className="text-center">
                          <p className="text-white font-bold text-sm">No User Selected</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Select a registered student from the list to view logs</p>
                        </div>
                      </div>
                    )}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-screen w-full max-w-lg bg-[#05071a] border-l border-white/10 z-[101] flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-white tracking-tight">Lead Profile</h2>
                <button onClick={() => setSelectedLead(null)} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-white/40"><XCircle size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{selectedLead.name}</h3>
                  <p className="text-indigo-400 font-bold mt-1">{selectedLead.email}</p>
                  <span className={cn("inline-block mt-3 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border", statusStyles[selectedLead.status || "new"])}>{selectedLead.status || "New"}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Stream", value: selectedLead.stream, icon: Briefcase },
                    { label: "Level", value: selectedLead.level, icon: GraduationCap },
                    { label: "State", value: selectedLead.state, icon: MapPin },
                    { label: "Cutoff", value: selectedLead.cutoff || "N/A", icon: null },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl bg-white/5 border border-white/5 p-5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="font-bold text-white text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Inquiry</p>
                  <div className="rounded-2xl bg-white/5 border border-white/5 p-5 text-white/50 text-sm leading-relaxed italic">"{selectedLead.message}"</div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Admin Notes</p>
                  <textarea
                    defaultValue={selectedLead.notes}
                    onBlur={e => updateLeadNotes(selectedLead.id, e.target.value)}
                    placeholder="Notes auto-save on blur…"
                    className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-5 text-white outline-none focus:border-indigo-500/50 resize-none text-sm font-medium placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <a href={`tel:${selectedLead.phone}`} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all text-sm">
                    <Phone size={18} /> Call: {selectedLead.phone}
                  </a>
                  <a href={`https://wa.me/91${selectedLead.phone}?text=Hi+${encodeURIComponent(selectedLead.name)},+CollegeMatch-AI+team+here.`} target="_blank" className="w-full h-14 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all text-sm">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
