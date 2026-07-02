import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#05071a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 pt-32">
        <h1 className="text-4xl font-bold mb-6">CollegeMatch-AI Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: June 2026</p>
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p>We collect only the information necessary to provide AI-powered college matching services. We do not sell your data.</p>
          <p>Your profile and interview history are stored securely in Google Firebase.</p>
          <p>Contact: <a href="mailto:kalim.apoffi@gmail.com" className="text-indigo-400 hover:text-indigo-300">kalim.apoffi@gmail.com</a> for data deletion requests.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
