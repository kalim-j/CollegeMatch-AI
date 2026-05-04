"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, MapPin, Award, BookOpen, Globe, Phone, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // In a real app, we would fetch college details by ID from Firestore or a database.
  // For this demo, we'll show a placeholder that looks premium.

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-xl">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Results
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
                <GraduationCap className="h-10 w-10" />
              </div>
              <h1 className="text-4xl font-bold">College of Academic Excellence</h1>
              <p className="text-xl opacity-90 mt-2">Nurturing Leaders for Tomorrow</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About this College</h2>
            <p className="text-muted-foreground leading-relaxed">
              This institution is renowned for its state-of-the-art facilities and world-class faculty. With a focus on research and innovation, it provides students with the tools they need to succeed in a competitive global landscape.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl p-4 text-center bg-muted/30 border-none">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">NIRF Rank</p>
                <p className="text-2xl font-bold text-primary">#42</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-muted/30 border-none">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">NAAC</p>
                <p className="text-2xl font-bold text-secondary">A++</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-muted/30 border-none">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Type</p>
                <p className="text-sm font-bold uppercase">Autonomous</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-muted/30 border-none">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Placement</p>
                <p className="text-sm font-bold uppercase">95%</p>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Offered Courses</h2>
            <div className="flex flex-wrap gap-3">
              {["Computer Science", "Artificial Intelligence", "Information Technology", "Cyber Security", "Data Science"].map(course => (
                <span key={course} className="px-4 py-2 rounded-2xl bg-white border border-primary/10 shadow-sm text-sm font-medium">
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2rem] border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-8">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI Suggestion Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-sm italic text-muted-foreground">
                "Based on your 185.5 cutoff and BC quota, this college is an 88% match for your profile. It's located within 50km of your hometown."
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span>Match Score</span>
                  <span className="text-primary">88%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[88%]" />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button className="w-full rounded-xl gap-2 h-12">
                  <Globe className="h-4 w-4" /> Official Website
                </Button>
                <Link href="/contact" className="w-full">
                  <Button variant="outline" className="w-full rounded-xl gap-2 h-12">
                    <Phone className="h-4 w-4" /> Admission Enquiry
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
