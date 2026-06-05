'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import College3DCard from '@/components/College3DCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PredictorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [marks, setMarks] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep(1);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: Number(marks), state, category }),
      });

      const data = await response.json();
      setColleges(data.colleges || []);
      setStep(2);
    } catch (error) {
      console.error('Prediction failed:', error);
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3">
            🎯 Find Your Perfect College
          </h1>
          <p className="text-gray-605 text-lg font-medium">
            Let our AI analyze your profile and find your best match
          </p>
        </motion.div>

        {step === 0 ? (
          /* Form */
          <motion.form
            onSubmit={handlePredict}
            className="max-w-2xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-8 border border-purple-200 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Marks Input */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Your 12th Marks (%)
              </label>
              <motion.input
                type="number"
                min="0"
                max="100"
                required
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter your percentage..."
                className="w-full px-5 py-3.5 rounded-xl bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold text-sm"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* State Select */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                State
              </label>
              <motion.select
                value={state}
                required
                onChange={(e) => setState(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-semibold text-sm"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="">Select your state...</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Telangana">Telangana</option>
              </motion.select>
            </motion.div>

            {/* Category Select */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Category
              </label>
              <motion.select
                value={category}
                required
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-semibold text-sm"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="">Select your category...</option>
                <option value="General">General (OC)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </motion.select>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!marks || !state || !category || loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  ⚡ Find My Colleges
                </>
              )}
            </motion.button>
          </motion.form>
        ) : step === 1 ? (
          /* Loading State */
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="relative w-32 h-32"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-purple-200" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600" />
            </motion.div>
            <motion.p
              className="mt-8 text-xl font-bold text-gray-700"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔮 Our AI is analyzing your profile...
            </motion.p>
          </motion.div>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
                ✓ Perfect Match Found!
              </h2>
              <p className="text-gray-600 font-semibold">
                Here are your top colleges based on your profile
              </p>
            </motion.div>

            {colleges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {colleges.map((college: any) => (
                  <College3DCard
                    key={college.id}
                    name={college.name}
                    rank={college.nirf_rank}
                    package={college.avg_package_lpa}
                    onClick={() => {
                      const slug = college.name.toLowerCase().replace(/ /g, "-");
                      // Store matches in sessionStorage so details page can retrieve it
                      sessionStorage.setItem('eduanalytics_results', JSON.stringify(colleges));
                      router.push(`/colleges/${slug}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center bg-white border border-purple-100 rounded-3xl p-12 mb-12">
                <p className="text-gray-500 font-bold mb-4">No matching colleges found for your search criteria.</p>
              </div>
            )}

            <motion.button
              onClick={() => setStep(0)}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Try Another Prediction
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
