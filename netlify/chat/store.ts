// Netlify Blobs: conversations, contact messages and rate-limit counters.

import { getStore } from '@netlify/blobs'
import type Anthropic from '@anthropic-ai/sdk'

export type ContactDraft = { name: string; email: string; message: string }

export type Conversation = {
  id: string
  site: string
  page?: string
  ipHash: string
  startedAt: string
  updatedAt: string
  // Full API history, thinking blocks included, replayed unchanged every turn.
  messages: Anthropic.MessageParam[]
  draft?: ContactDraft
  contactIds?: string[]
  // Told to the model on the next turn, e.g. that the visitor's message was sent.
  siteNote?: string
}

export type ContactMessage = ContactDraft & {
  id: string
  site: string
  page?: string
  conversationId?: string
  ipHash: string
  createdAt: string
}

const conversations = () => getStore({ name: 'chat-conversations', consistency: 'strong' })
const contacts = () => getStore({ name: 'chat-contacts', consistency: 'strong' })
const limits = () => getStore({ name: 'chat-ratelimits', consistency: 'strong' })

// Ids start with the time, so keys sort oldest to newest.
export function newId(): string {
  return `${Date.now().toString(36).padStart(9, '0')}-${crypto.randomUUID().slice(0, 8)}`
}

const ID_PATTERN = /^[0-9a-z]{9}-[0-9a-f]{8}$/
export const isId = (value: unknown): value is string => typeof value === 'string' && ID_PATTERN.test(value)

export async function loadConversation(id: string): Promise<Conversation | null> {
  return (await conversations().get(id, { type: 'json' })) as Conversation | null
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  await conversations().setJSON(conversation.id, conversation)
}

export async function saveContact(message: ContactMessage): Promise<void> {
  await contacts().setJSON(message.id, message)
}

// Newest first, at most `limit` of each.
export async function listInbox(limit: number) {
  const latest = async (store: ReturnType<typeof getStore>) => {
    const { blobs } = await store.list()
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, limit)
    return Promise.all(keys.map((key) => store.get(key, { type: 'json' })))
  }
  const [c, m] = await Promise.all([latest(conversations()), latest(contacts())])
  return { conversations: c.filter(Boolean) as Conversation[], contacts: m.filter(Boolean) as ContactMessage[] }
}

// Counters are read-then-write, so two requests in the same instant can both
// pass. Good enough to stop abuse; the Anthropic spend limit is the hard stop.
export async function overLimit(rules: { key: string; max: number; windowSeconds: number }[]): Promise<boolean> {
  for (const rule of rules) {
    if ((await counter(rule.key, rule.windowSeconds)) >= rule.max) return true
    await counter(rule.key, rule.windowSeconds, true)
  }
  return false
}

// The count in the current window; `bump` adds one first.
export async function counter(name: string, windowSeconds: number, bump = false): Promise<number> {
  const store = limits()
  const key = `${name}/${Math.floor(Date.now() / 1000 / windowSeconds)}`
  const count = ((await store.get(key, { type: 'json' })) as number | null) ?? 0
  if (!bump) return count
  await store.setJSON(key, count + 1)
  return count + 1
}

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT ?? 'mfirataksoy-chat'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`))
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('')
}
