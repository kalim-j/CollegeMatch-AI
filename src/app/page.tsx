import Link from "next/link";
import { ArrowRight, CheckCircle, GraduationCap, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-52 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-8 animate-bounce">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered College Predictions
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Navigate Your Future with <span className="text-primary italic">Precision.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop guessing and start planning. Our AI analyzes your scores and preferences to suggest the best-fit colleges in India with unmatched accuracy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
            >
              Start AI Interview <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/contact" 
              className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-xl text-lg font-bold hover:border-primary/30 transition-all flex items-center justify-center"
            >
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose EduAnalytics-AI?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine advanced AI models with deep industry knowledge to give you the edge in college admissions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <GraduationCap className="h-8 w-8 text-primary" />,
                title: "Personalized Suggestions",
                desc: "Get college recommendations tailored to your stream, marks, and budget constraints."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-primary" />,
                title: "Data-Driven Insights",
                desc: "We analyze cutoffs and placement data to ensure your choices are realistic and beneficial."
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-primary" />,
                title: "Verified Information",
                desc: "Our database is constantly updated with the latest info from top Indian universities."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50k+</div>
              <div className="text-primary-foreground/80 font-medium">Students Helped</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">2000+</div>
              <div className="text-primary-foreground/80 font-medium">Colleges Listed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-primary-foreground/80 font-medium">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80 font-medium">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to find your dream college?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of students who have simplified their admission journey with EduAnalytics-AI.</p>
            <div className="relative z-10">
              <Link 
                href="/register" 
                className="bg-primary text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-transform inline-block shadow-2xl shadow-primary/40"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
