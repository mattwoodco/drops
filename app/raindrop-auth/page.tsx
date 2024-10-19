import { cookies } from 'next/headers';
import AuthStatus from './AuthStatus';
import RaindropAuthButton from './RaindropAuthButton';

export default async function RaindropAuthPage() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('raindrop_access_token');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Drops Authentication</h1>
      {hasToken ? (
        <p className="text-xl mb-4">You are authenticated with Drops.</p>
      ) : (
        <>
          <p className="text-xl mb-4">You need to authenticate with Drops.</p>
          <RaindropAuthButton />
        </>
      )}
      <AuthStatus />
    </div>
  );
}
