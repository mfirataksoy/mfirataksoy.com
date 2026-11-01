import { siteForOrigin, type Site } from './knowledge/sites'

export function cors(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(origin) },
  })
}

// Shared front door for the widget's endpoints: CORS preflight, POST only,
// a known origin, and a small JSON body. Returns the site and body, or the
// response to send back.
export async function readWidgetRequest(
  req: Request,
  maxBytes: number,
): Promise<{ site: Site; body: Record<string, unknown>; origin: string } | Response> {
  const origin = req.headers.get('origin')
  const site = siteForOrigin(origin, new URL(req.url).searchParams.get('site'))
  if (!site || !origin) return json({ error: 'forbidden' }, 403, null)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)

  const text = await req.text()
  if (text.length > maxBytes) return json({ error: 'too_large' }, 413, origin)
  try {
    const body = JSON.parse(text)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object')
    return { site, body, origin }
  } catch {
    return json({ error: 'bad_request' }, 400, origin)
  }
}

export const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, max) : ''

export const EMAIL = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i
