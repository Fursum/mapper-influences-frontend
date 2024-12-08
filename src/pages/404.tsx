import { useEffect } from 'react';

import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const PageNotFound: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    // Timer to return to the home page
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [router.push]);

  return (
    <>
      <h1>This page does not exist!</h1>
      <p>Redirecting to the home page...</p>
    </>
  );
};

export default PageNotFound;
