export const dynamic = 'force-dynamic';

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
  if (!base) {
    return Response.json(
      { status: 'unready', reason: 'NEXT_PUBLIC_API_BASE_URL is not configured' },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${base}/api/health/ready`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return Response.json({ status: 'unready', upstreamStatus: upstream.status }, { status: 503 });
    }

    const body = await upstream.json().catch(() => ({}));
    return Response.json({ status: 'ok', upstream: body });
  } catch {
    return Response.json({ status: 'unready', reason: 'upstream unreachable' }, { status: 503 });
  }
}
