"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, History, Plus, Sparkles, User, MapPin, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InterviewSession } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [lastInterview, setLastInterview] = useState<InterviewSession | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (user) {
        const q = query(
          collection(db, "interviews"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setLastInterview({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as InterviewSession);
        }
      }
      setFetching(false);
    };
    fetchRecent();
  }, [user]);

  if (loading || !user) return <div className="flex items-center justify-center h-[80vh]">Loading your dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {profile?.fullName?.split(' ')[0] || "Student"}.
        </h1>
        <p className="text-muted-foreground mt-1">Let's find your perfect match today.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 rounded-3xl border-primary/10 shadow-lg overflow-hidden h-fit">
          <div className="h-24 bg-gradient-to-r from-[#534AB7] to-[#1D9E75]" />
          <CardContent className="relative pt-0 px-6 pb-6">
            <div className="flex justify-center">
              <div className="-mt-12 mb-4 p-1 rounded-full bg-white">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">{profile?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm p-3 rounded-2xl bg-muted/50">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{profile?.state ? `${profile.district}, ${profile.state}` : "Location not set"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 rounded-2xl bg-muted/50">
                <Award className="h-4 w-4 text-primary" />
                <span>{profile?.courseLevel ? `${profile.courseLevel} - ${profile.stream}` : "Academic info not set"}</span>
              </div>
            </div>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full mt-6 rounded-xl">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats & CTA */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-primary/10 bg-primary text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group" asChild>
              <Link href="/interview">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">New Interview</h3>
                  <p className="text-primary-foreground/80 mb-6">Start a fresh session to find new college matches.</p>
                  <div className="flex items-center text-sm font-bold gap-2">
                    Start Now <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="rounded-3xl border-primary/10 bg-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group" asChild>
              <Link href="/history">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Past Sessions</h3>
                  <p className="text-muted-foreground mb-6">Review your previous college suggestions and matches.</p>
                  <div className="flex items-center text-sm font-bold text-secondary gap-2">
                    View History <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="rounded-3xl border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Match</CardTitle>
              <CardDescription>Your last AI-powered college suggestion</CardDescription>
            </CardHeader>
            <CardContent>
              {fetching ? (
                <div className="py-8 text-center text-muted-foreground italic">Fetching your history...</div>
              ) : lastInterview ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{lastInterview.results[0].name}</p>
                        <p className="text-sm text-muted-foreground">{lastInterview.results[0].location}, {lastInterview.results[0].state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{lastInterview.results[0].match_score}%</div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Match Score</p>
                    </div>
                  </div>
                  <Link href={`/history`}>
                    <Button variant="link" className="p-0 h-auto text-primary font-bold">
                      View all 8 matches from this session →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-muted-foreground italic mb-6">No interview sessions found yet.</p>
                  <Link href="/interview">
                    <Button className="rounded-xl">Start Your First Interview</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
