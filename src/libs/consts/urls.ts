export const OSU_BASE_URL = 'https://osu.ppy.sh/';

// The backend sets the OAuth state cookie, then redirects to the osu! login page.
export const getOsuAuthUrl = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/oauth/login`;
