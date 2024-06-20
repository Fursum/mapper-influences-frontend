import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { logoutRequest, useCurrentUser } from '@services/user';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';

const LOGIN_PAGE_URL = '/';

const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const [redirectUrl, setRedirectUrl] = useLocalStorage<string | null>(
    'redirect',
    null,
  );

  // Manual logout
  const logout = useCallback(() => {
    logoutRequest()
      .then(() => {
        queryClient.resetQueries({
          queryKey: ['currentUser'],
        });
        router.push(LOGIN_PAGE_URL);
      })
      .catch(() => {
        toast.error('Failed to logout. 🤔');
      });
  }, [router.push, queryClient.resetQueries]);

  // Kick user to home page if not logged in
  // or redirect to dashboard if logged in
  // biome-ignore lint/correctness/useExhaustiveDependencies: <no need to check set calls>
  useEffect(() => {
    if (isLoading) return;

    if (user && redirectUrl) {
      router.push(redirectUrl);
      setRedirectUrl(null);
      return;
    }

    if (router.asPath === LOGIN_PAGE_URL) {
      if (!user || error) return;
      router.push('/dashboard');
    }

    if (!user || error) {
      setRedirectUrl(router.asPath);
      router.push(LOGIN_PAGE_URL);
    }
  }, [isLoading, router, user, error, redirectUrl]);

  return { logout };
};

export default useAuth;
