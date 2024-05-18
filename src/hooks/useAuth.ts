import { useCallback, useEffect } from 'react';

import { useCurrentUser } from '@services/user';
import { useRouter } from 'next/router';

const REDIRECT_URL = '/';

const useAuth = () => {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  // Manual logout
  const logout = useCallback(() => {
    // Logout endpoint
    router.push(REDIRECT_URL); // Wont work yet
  }, [router.push]);

  // Kick user to home page if not logged in
  // or redirect to dashboard if logged in
  useEffect(() => {
    if (isLoading) return;
    if (router.asPath === REDIRECT_URL) {
      if (!user) return;
      router.push('/dashboard');
    }

    if (!user) {
      router.push(REDIRECT_URL);
    }
  }, [isLoading, router, user]);

  return { logout };
};

export default useAuth;
