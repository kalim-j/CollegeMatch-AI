import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 text-gray-900">
        {children}
      </div>
    </AdminGuard>
  );
}
