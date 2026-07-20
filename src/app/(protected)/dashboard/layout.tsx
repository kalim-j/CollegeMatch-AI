'use client';
import React from 'react';
import { useAuthGuard } from '@/lib/auth-guard';
import PageLoader from '@/components/PageLoader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAuthGuard();

  if (state !== 'verified') {
    return <PageLoader />;
  }

  return (
    <div className="pb-20 sm:pb-0">
      {children}
    </div>
  );
}
