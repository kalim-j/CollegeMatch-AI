import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#05071a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 pt-32">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p>CollegeMatch-AI is a free service for Indian students.</p>
          <p>AI suggestions are for guidance only and not guaranteed to reflect actual admission outcomes.</p>
          <p>College data is based on publicly available information and may not be 100% accurate. Use at your own discretion.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
