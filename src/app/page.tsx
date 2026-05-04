"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Sparkles, History, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      title: "AI Analysis",
      description: "Our advanced Llama-3 model analyzes your marks and preferences to find perfect matches.",
      icon: Sparkles,
      color: "bg-purple-500",
    },
    {
      title: "Deep Insights",
      description: "Get NIRF rankings, NAAC grades, and detailed cutoff data for over 500+ Indian colleges.",
      icon: Search,
      color: "bg-blue-500",
    },
    {
      title: "Smart Budgeting",
      description: "Filter by Government, Private, or Deemed universities to match your financial goals.",
      icon: GraduationCap,
      color: "bg-teal-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 md:py-32">
        {/* Background blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 mb-6 text-sm font-medium bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-secondary mr-2" />
              <span className="text-secondary font-bold mr-1">New:</span> 
              <span className="text-muted-foreground">Llama-3.3 Powered Admissions Counselling</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Your <span className="text-primary italic">dream college</span> is <br />
              closer than you think.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Let AI find the best fit for your marks, state, and budget. 
              Our intelligent system analyzes thousands of data points to guide your future.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all gap-2">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl">
                  Talk to an Expert
                </Button>
              </Link>
            </div>
            
            <p className="mt-8 text-sm font-medium text-muted-foreground flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-secondary" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-secondary" /> 500+ Colleges</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose EduAnalytics-AI?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We combine data with inspiration to provide a roadmap for your academic journey.
            </p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={item} className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm hover:shadow-md transition-all">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg", feature.color)}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <div className="bg-primary/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/10">
              <Sparkles className="h-32 w-32" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 italic">
              "Every rank has a college. Let's find yours."
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic mb-8">
              "I thought my marks weren't good enough for a top engineering college in TN. EduAnalytics-AI found me an autonomous college with a great placement record that I hadn't even considered. Forever grateful!"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20" />
              <div className="text-left">
                <p className="font-bold">Rahul Krishnan</p>
                <p className="text-sm text-muted-foreground">Engineering Student, Chennai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to find your match?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join 5,000+ students who found their future through EduAnalytics-AI.</p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg rounded-2xl bg-[#1D9E75] hover:bg-[#1D9E75]/90">
              Start Free Assessment Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
