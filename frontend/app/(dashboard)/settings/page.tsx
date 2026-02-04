'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to users page by default
    router.push('/settings/users');
  }, [router]);

  return null;
}

