export const OSU_BASE_URL = 'https://osu.ppy.sh/';

export const getOsuAuthUrl = () => {
  const params = new URLSearchParams();
  params.append('response_type', 'code');
  params.append('client_id', process.env.NEXT_PUBLIC_OSU_CLIENT_ID || '');
  params.append('redirect_uri', process.env.NEXT_PUBLIC_OSU_REDIRECT_URI || '');
  params.append('scope', 'public identify');
  return `${OSU_BASE_URL}oauth/authorize?${params.toString()}`;
};
