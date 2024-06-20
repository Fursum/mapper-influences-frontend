import ProfilePage from '@components/PageComponents/ProfilePage';
import useAuth from '@hooks/useAuth';
import { getUserBio, useCurrentUser, useFullUser } from '@services/user';
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
  const { cachedData } = props;

  const { data: currentUser } = useCurrentUser();

  const {
    error,
    isLoading,
    data: profileData,
  } = useFullUser(mapperId?.toString());

  // Hack to force editable checks to be correct
  // Before i was assuming the current profile wouldnt use the id from the url
  const isSelf = currentUser?.id.toString() === mapperId?.toString();

  if (!isLoading && error && mapperId) {
    router.push('/404');
  }

  return (
    <>
      <Head>
        <title>{`${cachedData?.username ?? profileData?.username ?? 'Profile'} - Mapper Influences`}</title>
        <meta
          name="description"
          content={`Check out the influences of ${cachedData?.username ? cachedData.username : 'a mapper'}.`}
        />
      </Head>
      <ProfilePage userId={!isSelf ? mapperId?.toString() : undefined} />
    </>
  );
};

export default MapperPage;

export const getStaticProps = async (
  context: GetServerSidePropsContext<{ mapperId: string }>,
) => {
  const { mapperId } = context.params || {};

  if (!mapperId) return { notFound: true };

  try {
    const mapperData = await getUserBio(mapperId.toString());

    return {
      props: {
        cachedData: mapperData,
      },
      revalidate: 600,
    };
  } catch (_) {
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: true };
};
