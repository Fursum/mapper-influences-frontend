import { type NextRequest, NextResponse } from 'next/server';

// Link preview crawlers that need server-rendered Open Graph meta.
// Everyone else gets the static page as usual.
const BOT_USER_AGENTS =
  /discordbot|twitterbot|slackbot|telegrambot|whatsapp|facebookexternalhit|linkedinbot/i;

export const config = {
  matcher: '/profile/:mapperId',
};

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!BOT_USER_AGENTS.test(userAgent)) return NextResponse.next();

  const mapperId = request.nextUrl.pathname.split('/')[2];
  if (!mapperId || !/^\d+$/.test(mapperId)) return NextResponse.next();

  return NextResponse.rewrite(
    `${process.env.NEXT_PUBLIC_API_URL}/og/user/${mapperId}`,
  );
}
