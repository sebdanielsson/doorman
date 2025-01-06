import { Metadata } from 'next';

import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Logga in',
};

export default function Page() {
  return <LoginForm />;
}
