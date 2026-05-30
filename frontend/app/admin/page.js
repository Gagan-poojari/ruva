'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminSessionValid } from '@/utils/adminAuth';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      isAdminSessionValid() ? '/admin/dashboard' : '/admin/login'
    );
  }, [router]);

  return null;
}
