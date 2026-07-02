'use client';
import { useWishlist } from '@/hooks/useWishlist';
import { Heart, Loader2, MapPin, SearchX, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';

export default function WishlistPage() {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#05071a]' : 'bg-[#f8f7ff]'}`}>
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400">
              <Heart className="text-pink-500 fill-pink-500" size={40} /> My Wishlist
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Colleges you've saved for later. Keep track of your dream destinations here.
            </p>
          </div>

          {wishlist.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
            }`}>
              <div className="w-24 h-24 mx-auto mb-6 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center border border-pink-100 dark:border-pink-900/50">
                <SearchX className="w-10 h-10 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Explore colleges in the Predictor or Interview simulator and click the heart icon to save them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((college) => (
                <div key={college.id} className={`group relative rounded-[2rem] overflow-hidden border shadow-xl transition-all hover:scale-[1.02] ${
                  isDark ? 'bg-slate-900/60 border-purple-900/20' : 'bg-white border-purple-100'
                }`}>
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-700">
                    <img 
                      src={`https://source.unsplash.com/400x240/?${encodeURIComponent(college.image_query)}`}
                      alt={college.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <button 
                      onClick={() => toggleWishlist(college)}
                      className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-pink-500 hover:bg-white/40 transition-colors"
                    >
                      <Heart size={20} className="fill-pink-500" />
                    </button>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white line-clamp-2">{college.name}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {college.city}, {college.state}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                      View Details <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
