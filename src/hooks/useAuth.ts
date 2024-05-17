import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import axios from 'axios';
import { useRouter } from 'next/router';
import { useIsClient } from 'usehooks-ts';

import { useCurrentUser } from './useUser';

const REDIRECT_URL = '/';

const useAuth = () => {
  const router = useRouter();
  const { data: user, isLoading, error, errorUpdatedAt } = useCurrentUser();
  const isClient = useIsClient();

  // Manual logout
  const logout = useCallback(() => {
    // Logout endpoint
    router.push(REDIRECT_URL); // Wont work yet
  }, [router.push]);

  useEffect(() => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 500 &&
      errorUpdatedAt &&
      isClient &&
      router.asPath === '/'
    )
      toast.error('Failed to log in.');
  }, [errorUpdatedAt]);

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
