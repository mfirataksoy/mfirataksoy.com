// Bindings and settings of the Pages project (wrangler.toml, plus secrets set with
// `wrangler pages secret put`).
export type Env = {
  DB: D1Database
  ANTHROPIC_API_KEY?: string
  INBOX_PASSWORD?: string
  CHAT_DAILY_LIMIT?: string
  CHAT_MOCK?: string
  IP_HASH_SALT?: string
  RESEND_API_KEY?: string
  NOTIFY_EMAIL?: string
  NOTIFY_FROM?: string
}

// Cloudflare puts the visitor's address in this header.
export const clientIp = (req: Request) => req.headers.get('cf-connecting-ip') ?? ''
