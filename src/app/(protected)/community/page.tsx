'use client';
import { useAuthGuard } from '@/lib/auth-guard';
import ScrollReveal from '@/components/ScrollReveal';
import { useState } from 'react';
import { Users, MessageSquare, ThumbsUp, Send, UserCircle, Search, Flame } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';

interface Post {
  id: string;
  author: string;
  college: string;
  content: string;
  upvotes: number;
  replies: number;
  timeAgo: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Rajesh K.',
    college: 'CEG, Anna University',
    content: 'Just got placed at Zoho! The CS curriculum here is really geared towards practical software engineering. Happy to answer any questions about placements!',
    upvotes: 124,
    replies: 18,
    timeAgo: '2 hours ago'
  },
  {
    id: '2',
    author: 'Priya M.',
    college: 'PSG College of Technology',
    content: 'Can someone tell me how the hostel facilities are for first-year girls? Thinking of joining ECE this year.',
    upvotes: 45,
    replies: 12,
    timeAgo: '5 hours ago'
  },
  {
    id: '3',
    author: 'Arun V.',
    college: 'SSN College of Engineering',
    content: 'The campus life is amazing, but be prepared for a strict academic schedule. You really have to balance both if you want to succeed here.',
    upvotes: 89,
    replies: 5,
    timeAgo: '1 day ago'
  }
];

export default function CommunityPage() {
  const { state } = useAuthGuard();
  if (state !== 'verified') return null;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: 'You',
      college: 'Future Student',
      content: newPost,
      upvotes: 0,
      replies: 0,
      timeAgo: 'Just now'
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleUpvote = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  return (
    <PageTransition>
    <ScrollReveal direction="up">

      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-600">
              Alumni Connect
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Join the conversation. Ask questions, share experiences, and connect with students and alumni from top colleges.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl ${
            isDark ? 'bg-slate-900/60 border-pink-900/20 backdrop-blur-xl' : 'bg-white border-pink-100'
          }`}>
            <form onSubmit={handlePost} className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                <UserCircle size={24} className="text-pink-500" />
              </div>
              <input 
                type="text"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Ask a question or share your college experience..."
                className={`flex-1 p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                  isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                }`}
              />
              <button 
                type="submit"
                disabled={!newPost.trim()}
                className="px-6 bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/20 hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={18} /> <span className="hidden md:inline">Post</span>
              </button>
            </form>
          </div>

          <div className="flex gap-4 border-b dark:border-slate-800 pb-2">
            <button className="text-pink-500 font-bold border-b-2 border-pink-500 pb-2 flex items-center gap-2">
              <Flame size={16} /> Trending
            </button>
            <button className="text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white pb-2 flex items-center gap-2">
              <Users size={16} /> Following
            </button>
          </div>

          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {post.author}
                        <span className="text-xs font-normal text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-full">
                          {post.college}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{post.timeAgo}</div>
                    </div>
                  </div>
                </div>

                <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {post.content}
                </p>

                <div className="flex items-center gap-6 border-t dark:border-slate-800 pt-4">
                  <button 
                    onClick={() => handleUpvote(post.id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-pink-500 font-bold text-sm transition-colors"
                  >
                    <ThumbsUp size={18} /> {post.upvotes}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-bold text-sm transition-colors">
                    <MessageSquare size={18} /> {post.replies} Replies
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </ScrollReveal>
    </PageTransition>
  );
}
