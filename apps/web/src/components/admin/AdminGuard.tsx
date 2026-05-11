'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !token) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, token, router, mounted]);

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
