import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import { mockRequest } from '@libs/functions';
import { getUserBio, useFullUser } from '@services/user';
import type {
  GetServerSidePropsContext,
  GetStaticPaths,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MapperPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (
  props,
) => {
  useAuth();
  const router = useRouter();
  const { mapperId } = router.query;

  const {
    error,
    isLoading,
    data: profileData,
  } = useFullUser(mapperId?.toString());

  if (!isLoading && error && mapperId) {
    router.push('/404');
  }

  console.log(props);
  return (
    <>
      <Head>
        {profileData && (
          <title>{`${profileData?.username} - Mapper Influences`}</title>
        )}
        <meta
          name="description"
          content={'Check out the influences of a mapper.'}
        />
      </Head>
      <ProfilePage userId={mapperId?.toString()} />
    </>
  );
};

export default MapperPage;

export const getStaticProps = async (
  context: GetServerSidePropsContext<{ mapperId: string }>,
) => {
  const { mapperId } = context.params || {};

  if (!mapperId) return { notFound: true };

  const mapperData = await getUserBio(mapperId.toString());

  await mockRequest('', 5000);

  if (!mapperData) return { notFound: true };

  return {
    props: {
      cachedData: mapperData,
      date: new Date().toISOString(),
    },
    revalidate: 600,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: true };
};
