"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  Sparkles, 
  History, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Play
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const stats = [
    { label: "Students Guided", value: "10,000+" },
    { label: "Colleges Mapped", value: "500+" },
    { label: "Accuracy Rate", value: "98%" },
    { label: "Cost to Students", value: "Always Free" },
  ];

  const features = [
    {
      title: "AI-Powered Matching",
      description: "Our advanced algorithms match your unique profile with the best-fit colleges across India.",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Marks Analysis",
      description: "Seamless support for CBSE/ICSE (500) and State Boards like Tamil Nadu (1200).",
      icon: Award,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "College Insights",
      description: "Deep dive into NIRF rankings, NAAC grades, placements, and campus facilities.",
      icon: Search,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
    },
    {
      title: "Session History",
      description: "Save your analysis results and track your progress through your personal dashboard.",
      icon: History,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Safe & Private",
      description: "Your academic data is encrypted and used only to provide you with the best recommendations.",
      icon: ShieldCheck,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Instant Results",
      description: "Get your personalized college shortlist in seconds, not days. Fast and reliable.",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const steps = [
    { title: "Enter Details", desc: "Share your marks, preferences, and location." },
    { title: "AI Analyses", desc: "Our engine processes 500+ college datasets." },
    { title: "Get Shortlist", desc: "Receive a curated list of dream colleges." },
    { title: "Decide with Confidence", desc: "Make the right choice for your future." },
  ];

  const testimonials = [
    {
      quote: "I thought my marks weren't good enough for a top engineering college. CollegeMatch found me an autonomous college that I hadn't even considered. Forever grateful!",
      author: "Rahul Krishnan",
      info: "Engineering Student, Chennai",
      initials: "RK"
    },
    {
      quote: "As a student from a TN Govt school with a 1200-mark background, I was confused by the options. This AI tool gave me clarity and a perfect roadmap.",
      author: "Priya Dharshini",
      info: "State Board Student, Madurai",
      initials: "PD"
    },
    {
      quote: "The interface is so clean and easy to use. The accuracy of the cutoff predictions is impressive. Every student should try this before counselling.",
      author: "Arjun Mehta",
      info: "CBSE Student, Bangalore",
      initials: "AM"
    }
  ];

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden py-20 lg:py-32">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 mb-8 text-sm font-medium bg-white/40 backdrop-blur-md shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse mr-2" />
                <span className="text-secondary font-bold mr-1">New:</span> 
                <span className="text-muted-foreground">Llama-3.3 Powered Predictions</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                AI College Predictor for <span className="text-primary italic">India</span> — <br />
                Find Your Dream College.
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                Free AI-powered admission predictor. Enter your JEE / board marks, 
                state, and budget — get instant college recommendations from 43,000+ 
                Indian colleges including IITs, NITs, IIITs and private colleges.
              </p>

              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/interview">
                  <Button size="lg" className="h-16 px-12 text-xl rounded-[2rem] shadow-2xl hover:shadow-primary/30 transition-all gap-3 bg-primary hover:scale-105 active:scale-95">
                    Start Your Free Analysis <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="h-16 px-10 text-xl rounded-[2rem] bg-white/20 backdrop-blur-md border-primary/20 hover:bg-white/40 transition-all gap-2">
                    <Play className="h-5 w-5 fill-primary text-primary" /> Watch How It Works
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-muted shadow-sm overflow-hidden flex items-center justify-center">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  Joined by <span className="text-primary">10,000+</span> ambitious students
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Background Blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white/30 backdrop-blur-md border-y border-primary/5">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-3xl bg-white/40 border border-white/20 shadow-sm"
              >
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Why Choose CollegeMatch?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine deep data with cutting-edge AI to provide you with the most accurate college roadmaps in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-default"
              >
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:rotate-6", feature.bgColor, feature.color)}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-primary/5 border-y border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground">Your journey from marks to a dream campus in 4 simple steps.</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-primary/10 -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="relative z-10 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black mx-auto mb-8 shadow-xl border-4 border-white">
                    {idx + 1}
                  </div>
                  <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                  <p className="text-muted-foreground px-4">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Student Stories</h2>
            <p className="text-xl text-muted-foreground">Hear from students who found their future through CollegeMatch.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-xl relative"
              >
                <div className="text-primary opacity-20 absolute top-10 right-10">
                  <Sparkles className="h-12 w-12" />
                </div>
                <p className="text-lg italic text-muted-foreground mb-8 leading-relaxed relative z-10">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">{t.author}</p>
                    <p className="text-sm text-muted-foreground">{t.info}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#5b3ee8] to-[#3b2cb7] rounded-[3.5rem] p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-black mb-8">Your Future Starts with One Click</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students and discover the college that truly matches your potential. No credit card, no fees, just results.
            </p>
            <Link href="/interview">
              <Button size="lg" className="h-16 px-14 text-xl rounded-2xl bg-white text-primary hover:bg-white/90 shadow-2xl font-black gap-2 transition-transform hover:scale-105 active:scale-95">
                Start Analysis Now <ArrowRight className="h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
