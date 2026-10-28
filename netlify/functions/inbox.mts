// GET /api/inbox: every contact message and chat, for Fırat only.
// Password in INBOX_PASSWORD; sent as "Authorization: Bearer <password>".

import type { Config, Context } from '@netlify/functions'
import { counter, hashIp, listInbox, type Conversation } from '../chat/store'

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  const password = process.env.INBOX_PASSWORD
  if (!password || password.length < 12) return new Response('{"error":"not_configured"}', { status: 503, headers })

  // Only wrong passwords count, 8 per 15 minutes per IP.
  const failures = `inbox/fail/${await hashIp(context.ip)}`
  if ((await counter(failures, 900)) >= 8) return new Response('{"error":"rate_limited"}', { status: 429, headers })
  const given = (req.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  if (!(await sameSecret(given, password))) {
    await counter(failures, 900, true)
    return new Response('{"error":"unauthorized"}', { status: 401, headers })
  }

  const { conversations, contacts } = await listInbox(300)
  return new Response(JSON.stringify({ contacts, conversations: conversations.map(transcript) }), { headers })
}

// Text only: what the visitor typed, what the assistant said, and any drafts.
function transcript(c: Conversation) {
  const lines: { role: 'visitor' | 'assistant' | 'draft'; text: string }[] = []
  for (const m of c.messages) {
    if (m.role === 'system') continue
    if (typeof m.content === 'string') {
      lines.push({ role: m.role === 'user' ? 'visitor' : 'assistant', text: m.content })
      continue
    }
    for (const block of m.content) {
      if (block.type === 'text') lines.push({ role: m.role === 'user' ? 'visitor' : 'assistant', text: block.text })
      if (block.type === 'tool_use') lines.push({ role: 'draft', text: JSON.stringify(block.input) })
    }
  }
  return { id: c.id, site: c.site, page: c.page, startedAt: c.startedAt, updatedAt: c.updatedAt, contactIds: c.contactIds ?? [], lines }
}

async function sameSecret(a: string, b: string) {
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
  const [x, y] = await Promise.all([digest(a), digest(b)])
  return x.every((byte, i) => byte === y[i])
}

export const config: Config = { path: '/api/inbox' }
