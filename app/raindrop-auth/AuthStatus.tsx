'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthStatus() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (error) {
    return <p className="text-red-500 mt-4">Authentication error: {error}</p>;
  }

  return null;
}
