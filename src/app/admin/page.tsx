"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, TrendingUp, MessageSquare, Settings, 
  Search, Download, ExternalLink, Activity, Clock, MapPin, 
  Calendar, Mail, User, LogOut, ChevronRight, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (!authLoading) {
        if (!user || user.email !== "kalimdon07@gmail.com") {
          router.push("/dashboard");
          return;
        }
        await fetchData();
        setLoading(false);
      }
    };
    init();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      console.log("Fetching admin data from Firestore...");
      // 1. Fetch Users from Firestore
      console.log("Using DB instance:", db.app.name);
      const usersSnap = await getDocs(collection(db, "users"));
      console.log("Firestore Response size:", usersSnap.size);
      console.log("Firestore Response empty:", usersSnap.empty);
      
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Mapped Users Data length:", usersData.length);
      setUsersList(usersData);

      // Verify connection by checking current user
      if (user) {
        const selfDoc = await getDoc(doc(db, "users", user.uid));
        console.log("Admin self-check in Firestore:", selfDoc.exists(), selfDoc.data());
      }

      // 2. Fetch Contact Submissions (Messages) from Supabase
      const { data: submissions, error: subError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subError) console.error("Supabase Error:", subError);
      setMessages(submissions || []);

      // 3. Calculate Stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);

      const onlineNowCount = usersData.filter((u: any) => u.isOnline === true).length;

      const usersWeek = usersData.filter((u: any) => {
        const createdAt = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt || Date.now());
        return createdAt >= oneWeekAgo;
      }).length;

      const activeToday = usersData.filter((u: any) => {
        const lastActive = u.lastActive?.seconds ? new Date(u.lastActive.seconds * 1000) : new Date(u.lastActive || Date.now());
        return lastActive >= todayStart;
      }).length;

      setStats({
        total_users: usersData.length,
        users_week: usersWeek,
        total_searches: 124, 
        active_today: activeToday,
        online_now: onlineNowCount,
        signups: [
          { date: 'Mon', count: 2 },
          { date: 'Tue', count: 5 },
          { date: 'Wed', count: 3 },
          { date: 'Thu', count: 8 },
          { date: 'Fri', count: 6 },
          { date: 'Sat', count: 4 },
          { date: 'Sun', count: 2 },
        ],
        top_states: [
          { state: 'Tamil Nadu', count: 45 },
          { state: 'Maharashtra', count: 32 },
          { state: 'Karnataka', count: 28 },
          { state: 'Delhi', count: 20 },
          { state: 'Gujarat', count: 15 },
        ]
      });

      if (usersData.length === 0) {
        console.warn("No users found in Firestore 'users' collection. Checking Supabase 'profiles'...");
        // Fallback to Supabase users if Firestore is empty (during migration)
        try {
          const { data: supabaseUsers, error: sbError } = await supabase
            .from('profiles')
            .select('*');
          
          if (!sbError && supabaseUsers && supabaseUsers.length > 0) {
            console.log("Found users in Supabase profiles table:", supabaseUsers.length);
            const mappedSupabaseUsers = supabaseUsers.map(u => ({
              id: u.id || u.uid,
              fullName: u.full_name || u.fullName || "Supabase User",
              email: u.email,
              city: u.city || "Unknown",
              state: u.state || "Unknown",
              createdAt: u.created_at ? { seconds: Math.floor(new Date(u.created_at).getTime() / 1000) } : null,
              updatedAt: u.updated_at ? { seconds: Math.floor(new Date(u.updated_at).getTime() / 1000) } : null
            }));
            setUsersList(mappedSupabaseUsers);
            setStats((prev: any) => ({
              ...prev,
              total_users: mappedSupabaseUsers.length
            }));
            toast.info(`Note: Displaying ${mappedSupabaseUsers.length} users from Supabase legacy database.`);
          } else if (sbError) {
             console.error("Supabase Fallback Error:", sbError);
          }
        } catch (sbErr) {
          console.error("Supabase Fallback Catch:", sbErr);
        }
      }

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      if (error.code === 'permission-denied') {
        toast.error("Firestore Error: Permission Denied. You may need to update your Security Rules to allow 'list' on the users collection.");
      } else {
        toast.error(`Admin Fetch Error: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-300 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#111520] flex flex-col fixed h-full z-30">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/20">
              CM
            </div>
            <span className="text-xl font-black text-white font-syne">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Overview" },
            { id: "users", icon: Users, label: "Users" },
            { id: "analytics", icon: TrendingUp, label: "Analytics" },
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                  : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center font-black text-white">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Kalim Admin</p>
              <p className="text-[10px] text-slate-500 truncate">kalimdon07@gmail.com</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-[#0a0d14]">
        <div className="max-w-[1600px] mx-auto p-12 lg:p-16 space-y-16">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 border-b border-white/5 pb-16">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-white font-syne capitalize tracking-tighter leading-none">{activeTab}</h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.4em] ml-1">Intelligence Control Center</p>
              </div>
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="relative w-full lg:w-[450px]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                  <input 
                    type="text" 
                    placeholder="Search intelligence system..." 
                    className="w-full h-20 bg-white/[0.03] border border-white/10 rounded-3xl pl-16 pr-8 text-lg text-white outline-none focus:border-purple-500 transition-all font-bold shadow-2xl"
                  />
                </div>
              </div>
            </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: "Total Users", val: stats?.total_users || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "New This Week", val: stats?.users_week || 0, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "AI Searches", val: stats?.total_searches || 0, icon: Search, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "Online Now", val: stats?.online_now || 0, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className={`absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12 ${stat.color}`}>
                        <stat.icon size={120} />
                    </div>
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                        <stat.icon size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="text-5xl font-black text-white tabular-nums tracking-tighter">
                        {stat.val === 0 && usersList.length > 0 && stat.label === "Total Users" ? usersList.length : stat.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                  <h3 className="text-xl font-black text-white mb-6">User Signups (7 Days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.signups || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1f2937', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-6">Top 5 States</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.top_states || []}>
                            <XAxis dataKey="state" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1f2937', borderRadius: '12px' }} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div 
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111520] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <Search size={20} className="text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            className="bg-transparent outline-none w-96 text-white font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
                                <th className="px-8 py-5">#</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Location</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5">Last Active</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usersList.filter(u => {
                                const search = searchQuery.toLowerCase();
                                const name = (u.fullName || u.full_name || "").toLowerCase();
                                const email = (u.email || "").toLowerCase();
                                return name.includes(search) || email.includes(search);
                            }).map((u, i) => {
                                const lastActiveDate = u.updatedAt?.seconds ? new Date(u.updatedAt.seconds * 1000) : new Date(u.updatedAt || Date.now());
                                const isActive = new Date().getTime() - lastActiveDate.getTime() < 7 * 24 * 60 * 60 * 1000;
                                const joinDate = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt || Date.now());
                                return (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 font-black text-slate-600">{i + 1}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center font-black text-purple-400">
                                                    {(u.fullName || u.full_name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-purple-400 transition-colors">{u.fullName || u.full_name || "Unknown User"}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-600" />
                                                <span className="text-sm font-medium">
                                                    {u.city || u.state ? `${u.city || ''}${u.city && u.state ? ', ' : ''}${u.state || ''}` : 'Not Set'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm">{joinDate.toLocaleDateString()}</td>
                                        <td className="px-8 py-5 text-sm">{lastActiveDate.toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    u.isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {u.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => setSelectedUser(u)}
                                                className="h-10 w-10 bg-white/5 hover:bg-purple-500 hover:text-white rounded-xl transition-all inline-flex items-center justify-center group-hover:scale-110"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-[#111520] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                  <h3 className="text-2xl font-black text-white mb-8 font-syne">Regional User Distribution</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.top_states || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                        <YAxis dataKey="state" type="category" stroke="#fff" fontSize={12} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1f2937', borderRadius: '16px' }} />
                        <Bar dataKey="count" fill="url(#colorBar)" radius={[0, 10, 10, 0]}>
                           {stats?.top_states?.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#6366f1'} />
                           ))}
                        </Bar>
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#111520] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                  <h3 className="text-2xl font-black text-white mb-8 font-syne">Platform Engagement</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.signups || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1f2937', borderRadius: '16px' }} />
                        <Line 
                          type="step" 
                          dataKey="count" 
                          stroke="#10b981" 
                          strokeWidth={6} 
                          dot={{ r: 8, fill: '#10b981', strokeWidth: 0 }} 
                          activeDot={{ r: 12, strokeWidth: 0 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-[#111520] border border-white/5 rounded-[3rem] p-12 shadow-2xl text-center space-y-6">
                 <Activity size={60} className="text-purple-500 mx-auto animate-pulse" />
                 <h3 className="text-3xl font-black text-white font-syne">Real-time Traffic Analysis</h3>
                 <p className="text-slate-500 max-w-2xl mx-auto font-medium">Detailed tracking of user sessions, search queries, and AI model performance is being aggregated. Performance metrics will be available in the next sync.</p>
                 <div className="flex justify-center gap-4">
                    <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Session</p>
                        <p className="text-2xl font-black text-white font-syne">12m 45s</p>
                    </div>
                    <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Query Latency</p>
                        <p className="text-2xl font-black text-emerald-400 font-syne">840ms</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div 
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111520] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                 {messages.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
                                <th className="px-8 py-5">Sender</th>
                                <th className="px-8 py-5">Subject</th>
                                <th className="px-8 py-5">Message</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {messages.map((m) => (
                                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-white">{m.name}</p>
                                        <p className="text-xs text-slate-500">{m.email}</p>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-purple-400">{m.subject}</td>
                                    <td className="px-8 py-5 max-w-xs truncate text-sm">{m.message}</td>
                                    <td className="px-8 py-5 text-sm">{new Date(m.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            m.status === 'read' ? 'bg-slate-500/10 text-slate-500' : 'bg-purple-500/10 text-purple-400 animate-pulse'
                                        }`}>
                                            {m.status || 'New'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <div className="p-32 text-center space-y-6">
                        <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                            <Mail size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-white font-syne">No messages yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">When users contact you through the support form, their messages will appear here.</p>
                    </div>
                 )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                                <Settings size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white font-syne">System Config</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Maintenance Mode", desc: "Disable frontend access for updates", status: "Disabled" },
                                { label: "AI Prediction Engine", desc: "Using Groq Llama 3 70B", status: "Active" },
                                { label: "Public Registration", desc: "Allow new users to sign up", status: "Enabled" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                                    <div>
                                        <p className="font-bold text-white">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <div className="px-4 py-1.5 bg-purple-500/10 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                                        {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white font-syne">Security Logs</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { event: "Admin Login", time: "2 mins ago", ip: "192.168.1.1" },
                                { event: "DB Sync", time: "15 mins ago", ip: "System" },
                                { event: "Backup", time: "1 hour ago", ip: "Automated" }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border-l-4 border-purple-500 bg-white/[0.02]">
                                    <div className="text-xs font-black text-slate-500">{log.time}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{log.event}</p>
                                        <p className="text-[10px] text-slate-600 font-mono">{log.ip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                            Download Security Audit
                        </button>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Detail Drawer */}
        <AnimatePresence>
            {selectedUser && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#111520] border-l border-white/10 z-50 p-10 overflow-y-auto"
                    >
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all"
                        >
                            <ChevronRight size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-3xl text-white shadow-2xl shadow-purple-500/40 mb-6">
                                { (selectedUser.fullName || selectedUser.full_name || "U")[0] }
                            </div>
                            <h2 className="text-3xl font-black text-white font-syne">{selectedUser.fullName || selectedUser.full_name || "Unknown User"}</h2>
                            <p className="text-purple-400 font-bold">{selectedUser.email}</p>
                            <div className="mt-4 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                Profile Active
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">State</p>
                                    <p className="font-bold text-white">{selectedUser.state || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">City</p>
                                    <p className="font-bold text-white">{selectedUser.city || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">JEE Percentile</p>
                                    <p className="font-black text-purple-400 text-xl">{selectedUser.jeePercentile || '0'}%</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Board %</p>
                                    <p className="font-black text-amber-400 text-xl">{selectedUser.boardPercentage || '0'}%</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">User Details</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail size={16} className="text-purple-400" />
                                        <span className="text-slate-400">Email:</span>
                                        <span className="font-bold text-white">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar size={16} className="text-purple-400" />
                                        <span className="text-slate-400">Joined:</span>
                                        <span className="font-bold text-white">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <User size={16} className="text-purple-400" />
                                        <span className="text-slate-400">Course:</span>
                                        <span className="font-bold text-white">{selectedUser.preferredCourse}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
