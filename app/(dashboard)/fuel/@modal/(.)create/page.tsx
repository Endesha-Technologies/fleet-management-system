'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateFuelLogModal() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to the full create page instead of showing modal
    router.push('/fuel/create');
  }, [router]);

  return null;
}
