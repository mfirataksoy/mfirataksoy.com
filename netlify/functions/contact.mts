// POST /api/contact: the visitor pressed Send on a message to Fırat.
// Saved for /inbox, and emailed to him when RESEND_API_KEY is set.

import type { Config, Context } from '@netlify/functions'
import { clean, json, readWidgetRequest, EMAIL } from '../chat/http'
import { hashIp, isId, loadConversation, newId, overLimit, saveContact, saveConversation, type ContactMessage } from '../chat/store'

export default async (req: Request, context: Context) => {
  const parsed = await readWidgetRequest(req, 8000)
  if (parsed instanceof Response) return parsed
  const { site, body, origin } = parsed

  // Honeypot: a field people never see. Bots that fill it get a quiet "ok".
  if (clean(body.website, 200)) return json({ ok: true }, 200, origin)

  const name = clean(body.name, 100)
  const email = clean(body.email, 200)
  const message = clean(body.message, 3000)
  if (!name || !message || !EMAIL.test(email)) return json({ error: 'invalid' }, 400, origin)

  const ipHash = await hashIp(context.ip)
  const limited = await overLimit([
    { key: `contact/ip/${ipHash}/hour`, max: 3, windowSeconds: 3600 },
    { key: 'contact/all/day', max: 100, windowSeconds: 86400 },
  ])
  if (limited) return json({ error: 'rate_limited' }, 429, origin)

  const conversation = isId(body.conversationId) ? await loadConversation(body.conversationId) : null
  const contact: ContactMessage = {
    id: newId(),
    site: site.id,
    page: clean(body.page, 300),
    conversationId: conversation?.site === site.id ? conversation.id : undefined,
    name,
    email,
    message,
    ipHash,
    createdAt: new Date().toISOString(),
  }
  await saveContact(contact)

  if (conversation && contact.conversationId) {
    conversation.contactIds = [...(conversation.contactIds ?? []), contact.id]
    conversation.siteNote = 'The visitor pressed Send; their message to Fırat was delivered.'
    delete conversation.draft
    conversation.updatedAt = contact.createdAt
    await saveConversation(conversation)
  }

  await notify(contact).catch((error) => console.error('notify failed', error))
  return json({ ok: true }, 200, origin)
}

async function notify(contact: ContactMessage) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.NOTIFY_EMAIL
  if (!key || !to) return
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? 'Fırat’s AI <onboarding@resend.dev>',
      to: [to],
      reply_to: contact.email,
      subject: `New message from ${contact.name} (${contact.site})`,
      text: [
        `${contact.name} <${contact.email}>`,
        `Site: ${contact.site}${contact.page ? ` · ${contact.page}` : ''}`,
        '',
        contact.message,
        '',
        'All messages and chats: https://mfirataksoy.com/inbox/',
      ].join('\n'),
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
}

export const config: Config = { path: '/api/contact' }
