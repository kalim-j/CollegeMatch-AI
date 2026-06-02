'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  category: string;
  state: string;
  created_at: string;
  role: string;
  verified: boolean;
};

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pageSize] = useState(20);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: UserProfile[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            full_name: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            category: data.category || '',
            state: data.state || '',
            created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            role: data.role || 'student',
            verified: data.verified || false
          };
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...allUsers];

    if (filter === 'verified') {
      result = result.filter(u => u.verified);
    } else if (filter === 'unverified') {
      result = result.filter(u => !u.verified);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u => 
        (u.full_name?.toLowerCase() || '').includes(s) ||
        (u.email?.toLowerCase() || '').includes(s) ||
        (u.phone?.toLowerCase() || '').includes(s)
      );
    }

    setFilteredUsers(result);
    setPage(0);
  }, [search, filter, allUsers]);

  const displayedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900">User Management</h1>
              <p className="text-gray-500">Total users: {filteredUsers.length}</p>
            </div>
            <Link href="/admin/users"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                text-white font-bold hover:opacity-90 transition">
              Export Users
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-white/80 backdrop-blur
                border border-purple-200 text-gray-900
                placeholder:text-gray-400 focus:outline-none
                focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                transition" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur
                border border-purple-200 text-gray-900
                focus:outline-none focus:border-purple-500">
              <option value="all">All Users</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl
            border border-purple-100 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-blue-50
                  border-b border-purple-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">State</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700
                      uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full border-3 border-purple-200
                            border-t-purple-600 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((user, i) => (
                      <tr key={user.id} className="hover:bg-purple-50/50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{user.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700
                            font-medium text-xs">
                            {user.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{user.state || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold
                            ${user.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                            {user.verified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/users/${user.id}`}
                            className="text-purple-600 hover:text-purple-700 font-bold
                              transition hover:underline">
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4
              border-t border-purple-100">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700
                  font-bold disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-purple-200 transition">
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * pageSize >= filteredUsers.length}
                className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700
                  font-bold disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-purple-200 transition">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
