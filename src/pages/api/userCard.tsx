import { DEFAULT_AVATAR } from '@libs/consts';
import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const fontData = await fetch(
    new URL('../../../assets/font/Comfortaa-Bold.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer());
  const url = req.nextUrl;
  const searchParams = url.searchParams;
  const username = searchParams.get('username');
  const avatar = searchParams.get('avatar');
  const banner = searchParams.get('banner');
  const mentions = searchParams.get('mentions');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '1200px',
          height: '630px',
          backgroundColor: '#18171c',
          color: '#e6e6e6',
          fontFamily: 'Comfortaa Bold',
        }}
      >
        {banner && (
          <img
            src={banner}
            alt="banner"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: '0.1',
              objectFit: 'cover',
            }}
          />
        )}
        <h1
          style={{
            fontSize: '5rem',
          }}
        >
          Mapper Influences
        </h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '5rem',
            }}
          >
            {username}
          </h1>
        </div>
        <img
          src={avatar || DEFAULT_AVATAR}
          alt={username || 'avatar'}
          style={{
            width: '300px',
            height: '300px',
            borderRadius: '999px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Comfortaa Bold',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );
}
