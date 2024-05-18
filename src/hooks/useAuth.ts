import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { logoutRequest, useCurrentUser } from '@services/user';
import { useRouter } from 'next/router';

const REDIRECT_URL = '/';

const useAuth = () => {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  // Manual logout
  const logout = useCallback(() => {
    logoutRequest()
      .then(() => {
        router.push(REDIRECT_URL); // Wont work yet
      })
      .catch(() => {
        toast.error('Failed to logout. 🤔');
      });
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
