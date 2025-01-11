import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/components/login-form';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Logga in',
};

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  return <LoginForm />;
}
