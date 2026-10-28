// POST /api/chat: one visitor message in, the assistant's reply out.
// The conversation lives on the server, so visitors can't rewrite history.

import Anthropic from '@anthropic-ai/sdk'
import type { Config, Context } from '@netlify/functions'
import { clean, json, readWidgetRequest, EMAIL } from '../chat/http'
import { MODEL, draftTool, systemPrompt } from '../chat/prompt'
import { hashIp, isId, loadConversation, newId, overLimit, saveConversation, type ContactDraft, type Conversation } from '../chat/store'

const MAX_MESSAGE = 1000
const MAX_TURNS = 30

const fallback = {
  tr: 'Bu soruya cevap veremiyorum. Fırat’a doğrudan sormak isterseniz mesajınızı ona iletebilirim.',
  en: 'I can’t answer that one. If you’d like to ask Fırat directly, I can pass your message on to him.',
}

export default async (req: Request, context: Context) => {
  const parsed = await readWidgetRequest(req, 4000)
  if (parsed instanceof Response) return parsed
  const { site, body, origin } = parsed

  const message = clean(body.message, MAX_MESSAGE)
  if (!message) return json({ error: 'empty' }, 400, origin)
  const lang = body.lang === 'tr' ? 'tr' : 'en'

  const ipHash = await hashIp(context.ip)
  const limited = await overLimit([
    { key: `chat/ip/${ipHash}/10m`, max: 20, windowSeconds: 600 },
    { key: `chat/ip/${ipHash}/day`, max: 80, windowSeconds: 86400 },
    { key: 'chat/all/day', max: Number(process.env.CHAT_DAILY_LIMIT ?? 2000), windowSeconds: 86400 },
  ])
  if (limited) return json({ error: 'rate_limited' }, 429, origin)

  const now = new Date().toISOString()
  let conversation = isId(body.conversationId) ? await loadConversation(body.conversationId) : null
  if (conversation && conversation.site !== site.id) conversation = null
  conversation ??= { id: newId(), site: site.id, page: clean(body.page, 300), ipHash, startedAt: now, updatedAt: now, messages: [] }

  const turns = conversation.messages.filter((m) => m.role === 'user' && typeof m.content === 'string').length
  if (turns >= MAX_TURNS) return json({ error: 'conversation_full', conversationId: conversation.id }, 429, origin)

  conversation.messages.push({ role: 'user', content: message })
  if (conversation.siteNote) {
    // Operator channel: tells the model what the site did (e.g. the message was sent).
    conversation.messages.push({ role: 'system', content: `Site note: ${conversation.siteNote}` })
    delete conversation.siteNote
  }

  let reply: string
  let draft: ContactDraft | undefined
  try {
    ;({ reply, draft } = process.env.CHAT_MOCK === '1' ? mockTurn(conversation, message) : await runTurn(conversation, site))
  } catch (error) {
    console.error('chat failed', error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error)
    return json({ error: 'unavailable' }, 503, origin)
  }

  if (!reply.trim()) reply = fallback[lang]
  if (draft) conversation.draft = draft
  conversation.updatedAt = new Date().toISOString()
  await saveConversation(conversation)

  return json({ conversationId: conversation.id, reply, draft }, 200, origin)
}

const client = new Anthropic()

// One model call, plus a second one if the model drafted a contact message,
// so it can tell the visitor to check the card.
async function runTurn(conversation: Conversation, site: Parameters<typeof systemPrompt>[0]) {
  const system = systemPrompt(site)
  let reply = ''
  let draft: ContactDraft | undefined

  for (let step = 0; step < 2; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      tools: [draftTool],
      // The second call only words the follow-up; no second draft.
      tool_choice: step === 0 ? { type: 'auto' } : { type: 'none' },
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      cache_control: { type: 'ephemeral' },
      messages: conversation.messages,
    })

    if (response.stop_reason === 'refusal') {
      conversation.messages.push({ role: 'assistant', content: '(declined)' })
      return { reply: '', draft }
    }

    conversation.messages.push({ role: 'assistant', content: response.content })
    reply = [reply, ...response.content.flatMap((b) => (b.type === 'text' ? [b.text] : []))].filter(Boolean).join('\n\n')

    const call = response.content.find((b) => b.type === 'tool_use')
    if (response.stop_reason !== 'tool_use' || !call) break

    draft = toDraft(call.input)
    conversation.messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: call.id,
          is_error: !draft,
          content: draft
            ? 'The draft is now shown to the visitor as a card under your reply. In one short sentence, ask them to check it and press Send. It has not been sent yet.'
            : 'The draft was rejected: the email address looks invalid or a field is empty. Ask the visitor for the missing or corrected detail.',
        },
      ],
    })
  }
  return { reply, draft }
}

function toDraft(input: unknown): ContactDraft | undefined {
  const value = (input ?? {}) as Record<string, unknown>
  const draft = { name: clean(value.name, 100), email: clean(value.email, 200), message: clean(value.message, 3000) }
  return draft.name && draft.message && EMAIL.test(draft.email) ? draft : undefined
}

// CHAT_MOCK=1 exercises the widget and storage without an API key.
function mockTurn(conversation: Conversation, message: string) {
  const wantsContact = /ulaş|mesaj|contact|reach|hire|e-?posta|email/i.test(message)
  const draft = wantsContact ? { name: 'Test Visitor', email: 'visitor@example.com', message } : undefined
  const reply = wantsContact
    ? '(mock) Here is a draft for Fırat. Check it and press Send.'
    : `(mock) You said: “${message}”. Set ANTHROPIC_API_KEY for real answers.`
  conversation.messages.push({ role: 'assistant', content: reply })
  return { reply, draft }
}

export const config: Config = { path: '/api/chat' }
