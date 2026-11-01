// D1: conversations, contact messages and rate-limit counters.

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

// Ids start with the time, so keys sort oldest to newest.
export function newId(): string {
  return `${Date.now().toString(36).padStart(9, '0')}-${crypto.randomUUID().slice(0, 8)}`
}

const ID_PATTERN = /^[0-9a-z]{9}-[0-9a-f]{8}$/
export const isId = (value: unknown): value is string => typeof value === 'string' && ID_PATTERN.test(value)

export function createStore(db: D1Database) {
  const put = (table: 'conversations' | 'contacts', id: string, value: unknown) =>
    db.prepare(`INSERT INTO ${table} (id, data) VALUES (?1, ?2) ON CONFLICT (id) DO UPDATE SET data = excluded.data`).bind(id, JSON.stringify(value)).run()

  // The count in the current window; `bump` adds one first.
  async function counter(name: string, windowSeconds: number, bump = false): Promise<number> {
    const window = Math.floor(Date.now() / 1000 / windowSeconds)
    const key = `${name}/${window}`
    if (!bump) return (await db.prepare('SELECT count FROM counters WHERE key = ?1').bind(key).first<number>('count')) ?? 0
    const expiresAt = (window + 1) * windowSeconds
    const [, bumped] = await db.batch([
      db.prepare('DELETE FROM counters WHERE expires_at < ?1').bind(Math.floor(Date.now() / 1000)),
      db
        .prepare('INSERT INTO counters (key, count, expires_at) VALUES (?1, 1, ?2) ON CONFLICT (key) DO UPDATE SET count = count + 1 RETURNING count')
        .bind(key, expiresAt),
    ])
    return (bumped.results[0] as { count: number }).count
  }

  return {
    async loadConversation(id: string): Promise<Conversation | null> {
      const data = await db.prepare('SELECT data FROM conversations WHERE id = ?1').bind(id).first<string>('data')
      return data ? (JSON.parse(data) as Conversation) : null
    },

    saveConversation: (conversation: Conversation) => put('conversations', conversation.id, conversation),

    saveContact: (message: ContactMessage) => put('contacts', message.id, message),

    // Newest first, at most `limit` of each.
    async listInbox(limit: number) {
      const latest = async <T>(table: 'conversations' | 'contacts') => {
        const { results } = await db.prepare(`SELECT data FROM ${table} ORDER BY id DESC LIMIT ?1`).bind(limit).all<{ data: string }>()
        return results.map((row) => JSON.parse(row.data) as T)
      }
      const [conversations, contacts] = await Promise.all([latest<Conversation>('conversations'), latest<ContactMessage>('contacts')])
      return { conversations, contacts }
    },

    // A rule is checked before it is bumped, so two requests in the same instant
    // can both pass. Good enough to stop abuse; the Anthropic spend limit is the hard stop.
    async overLimit(rules: { key: string; max: number; windowSeconds: number }[]): Promise<boolean> {
      for (const rule of rules) {
        if ((await counter(rule.key, rule.windowSeconds)) >= rule.max) return true
        await counter(rule.key, rule.windowSeconds, true)
      }
      return false
    },

    counter,
  }
}

export type Store = ReturnType<typeof createStore>

export async function hashIp(ip: string, salt = 'mfirataksoy-chat'): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`))
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('')
}
