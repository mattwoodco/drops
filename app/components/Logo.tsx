'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Logo() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="text-3xl font-bold text-blue-600 hover:text-blue-800"
    >
      drops
    </Link>
  );
}
