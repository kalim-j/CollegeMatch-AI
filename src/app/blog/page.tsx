"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, GraduationCap, Award, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-20 lg:py-32">
      <div className="container px-4 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="text-primary font-bold mb-8 inline-block hover:underline">
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.2]">
            How to Choose the Best Engineering College in India Using AI
          </h1>
          
          <div className="flex items-center gap-4 mb-12 text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              AI
            </div>
            <div>
              <p className="font-bold text-white">CollegeMatch Editorial</p>
              <p className="text-sm">Updated May 2024 • 5 min read</p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none space-y-8 text-slate-300 leading-relaxed">
            <p>
              Selecting the right engineering college is one of the most critical decisions in a student's life. 
              With thousands of options across India, from prestigious IITs and NITs to top-tier private universities, 
              the search can be overwhelming. This is where an **AI college predictor** becomes your most valuable tool. 
              By analyzing millions of data points from previous year cutoffs and placement trends, 
              artificial intelligence can now provide recommendations that were previously only available through expensive career counselors.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 my-12">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Sparkles className="text-primary h-6 w-6" /> Why use an Admission AI?
              </h2>
              <p>
                Traditional search methods often rely on outdated rankings or biased opinions. 
                An **admission ai india** platform like CollegeMatch uses real-time data to match your 
                JEE, TNEA, or State Board marks with the colleges where you have the highest probability of admission. 
                It takes into account your category, home state quota, and even your preferred branch of engineering.
              </p>
            </div>

            <p>
              To find the **best engineering college india** for your specific profile, you need to look beyond 
              just the name. A smart **jee rank college predictor** evaluates the Return on Investment (ROI) by 
              comparing the fee structure against the average placement packages of the last three years. 
              Our AI tool does exactly this, filtering through 43,000+ colleges to highlight institutions 
              that offer the best value for your hard-earned marks.
            </p>

            <p>
              Finally, remember that the "best" college is the one that fits *you*. 
              Whether you prioritize research facilities, campus life, or high-package placements, 
              using a data-driven approach ensures you don't miss out on hidden gems. 
              Start using our tool today to see your personalized list and make a decision backed by science, not just rumors.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-20 p-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] border border-white/10 text-center"
          >
            <h3 className="text-3xl font-black mb-6">Ready to find your match?</h3>
            <p className="text-xl text-slate-400 mb-10">
              Get your personalized college predictions in under 60 seconds.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-12 text-xl rounded-2xl bg-primary hover:scale-105 transition-all gap-3">
                Go to Dashboard <ArrowRight className="h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
