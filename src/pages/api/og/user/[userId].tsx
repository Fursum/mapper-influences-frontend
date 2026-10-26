import { DEFAULT_AVATAR } from '@libs/consts';
import type { UserCard } from '@libs/types/rust';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

// Link embed image for a profile. The backend Open Graph page points og:image here.
// Only the user ID comes from the request. Every image URL comes from our own API.

export const config = {
  runtime: 'edge',
};

// Loaded once per instance, not once per request
const comfortaa = fetch(
  new URL('../../../../assets/Comfortaa-Bold.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

// Dark theme colors from toggledVariables.scss
const BACKGROUND = '#18171c';
const CARD = '#2b283d';
const TEXT = '#e6e6e6';
const TEXT_FADED = 'rgba(230, 230, 230, 0.5)';
const ACCENT = '#fbc6f5';

export default async function handler(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? '';
  if (!/^\d+$/.test(userId)) {
    return new Response('Invalid user ID', { status: 400 });
  }

  // Public endpoint. /users/{id} needs a login cookie.
  const userResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/og/user/${userId}/card`,
  );
  if (!userResponse.ok) {
    return new Response('User not found', { status: userResponse.status });
  }
  const user: UserCard = await userResponse.json();

  const stats = [
    { label: 'Mentions', value: user.mentions },
    { label: 'Influences', value: user.influences },
    { label: 'Ranked maps', value: user.ranked_maps },
  ];

  const group = user.groups[0];
  // "Beatmap Nominators" -> "Beatmap Nominator", same as the profile page
  const groupName = group?.name.replace(/s$/, '');
  const countryCode = user.country_code.toLowerCase();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 64,
        backgroundColor: BACKGROUND,
        backgroundImage: `radial-gradient(circle at 100% 0%, #59205f 0%, ${BACKGROUND} 60%)`,
        color: TEXT,
        fontFamily: 'Comfortaa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        {/* biome-ignore lint/a11y/useAltText: Satori renders to PNG, alt text has no reader */}
        <img
          src={user.avatar_url || DEFAULT_AVATAR}
          width={240}
          height={240}
          style={{ borderRadius: 9999, border: `6px solid ${ACCENT}` }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {group && (
            <div style={{ fontSize: 32, color: group.colour || ACCENT }}>
              {groupName}
            </div>
          )}
          <div
            style={{
              fontSize: user.username.length > 10 ? 72 : 96,
              lineHeight: 1,
            }}
          >
            {user.username}
          </div>
          {/^[a-z]{2}$/.test(countryCode) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* biome-ignore lint/a11y/useAltText: Satori renders to PNG, alt text has no reader */}
              <img
                src={`https://flagcdn.com/w80/${countryCode}.png`}
                width={48}
                height={32}
                style={{ borderRadius: 4 }}
              />
              <div style={{ fontSize: 32, color: TEXT_FADED }}>
                {user.country_name}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          {stats.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '20px 32px',
                borderRadius: 24,
                backgroundColor: CARD,
              }}
            >
              <div style={{ fontSize: 24, color: TEXT_FADED }}>{label}</div>
              {/* Satori fails on a number child, so pass a string */}
              <div style={{ fontSize: 56, color: ACCENT }}>
                {value.toLocaleString('en-US')}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 28, color: TEXT_FADED }}>Mapper Influences</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Comfortaa', data: await comfortaa, weight: 700 }],
      headers: {
        // Lowercase key, so it replaces the immutable default of ImageResponse
        'cache-control':
          'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
