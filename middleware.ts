const REALM = 'Counterpart';
const USERNAME = 'counterpart';

function unauthorized(): Response {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export default function middleware(request: Request): Response | undefined {
  const passcode = process.env.COUNTERPART_PASSCODE;

  if (!passcode) {
    return new Response('Counterpart passcode is not configured.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) return unauthorized();

  try {
    const credentials = atob(authorization.slice('Basic '.length));
    if (credentials !== `${USERNAME}:${passcode}`) return unauthorized();
  } catch {
    return unauthorized();
  }

  // An undefined response lets Vercel continue to the requested static asset.
  return undefined;
}
