/*
 * Fırat's AI: a chat widget for every site Fırat built.
 *
 *   <script src="https://mfirataksoy.com/chat/widget.js" data-site="filmfirtinasi" defer></script>
 *
 * Options (data- attributes): site (id from server/chat/knowledge/sites.ts),
 * lang ("tr" | "en", default: page or browser language), accent (CSS color),
 * bottom (px to lift the button, e.g. above a bottom tab bar), sound ("off" to start muted),
 * api (default: where this script is served from).
 * Everything renders in a shadow root, so host page styles can't leak in or out.
 */
(() => {
  if (window.__firatChat) return
  window.__firatChat = true

  const script = document.currentScript
  const data = (script && script.dataset) || {}
  const api = (data.api || new URL(script ? script.src : location.href).origin).replace(/\/$/, '')
  const site = data.site || 'mfirataksoy'
  const pageLang = (data.lang || document.documentElement.lang || navigator.language || 'en').toLowerCase()
  const lang = pageLang.startsWith('tr') ? 'tr' : 'en'
  const storageKey = `firat-chat:${site}`
  const STICKERS = ['wave', 'wink', 'party', 'coffee', 'thinking', 'laptop', 'heart', 'rocket']

  const t = {
    tr: {
      launcher: 'Fırat’ın yapay zekâsına sor',
      title: 'Fırat’ın yapay zekâsı',
      subtitle: 'Fırat ve projeleri hakkında sorun',
      greeting: 'Merhaba 👋 Ben Fırat’ın yapay zekâ asistanıyım. Deneyimini, projelerini, ya da ona nasıl ulaşabileceğinizi merak ediyorsanız sorun, seve seve anlatırım!',
      chips: ['Fırat ne iş yapıyor?', 'Hangi projeleri yaptı?', 'Fırat’a mesaj bırakmak istiyorum'],
      placeholder: 'Bir soru yazın…',
      send: 'Gönder',
      close: 'Kapat',
      note: 'Yapay zekâ hata yapabilir. Sohbetler Fırat’ın görmesi için kaydedilir.',
      leave: 'Fırat’a mesaj bırak',
      cardTitle: 'Fırat’a gidecek mesaj',
      name: 'Adınız',
      email: 'E-posta adresiniz',
      message: 'Mesajınız',
      sendCard: 'Fırat’a gönder',
      cancel: 'Vazgeç',
      sending: 'Gönderiliyor…',
      sent: 'Mesajınız Fırat’a iletildi. Teşekkürler! Size e-postayla dönecek.',
      invalid: 'Lütfen adınızı, geçerli bir e-posta adresini ve mesajınızı yazın.',
      limited: 'Biraz hızlı gidiyoruz. Birkaç dakika sonra tekrar deneyin, ya da Fırat’a mesaj bırakın.',
      full: 'Bu sohbet çok uzadı. Sorunuzu doğrudan Fırat’a iletebilirsiniz.',
      down: 'Şu an cevap veremiyorum. Fırat’a mesaj bırakmak ister misiniz?',
      typing: 'Yazıyor',
      privacy: 'Mesajların bir yapay zekâ (Anthropic, ABD) tarafından işlenir ve site sahibi tarafından okunabilir. Hassas bilgi paylaşma.',
      privacyLink: 'KVKK',
      privacyHref: '/kvkk/',
    },
    en: {
      launcher: 'Ask Fırat’s AI',
      title: 'Fırat’s AI',
      subtitle: 'Ask about Fırat and his projects',
      greeting: 'Hi there 👋 I’m Fırat’s AI assistant. Curious about his experience, his projects, or how to reach him? Ask away, I’m happy to help!',
      chips: ['What does Fırat do?', 'What has he built?', 'I’d like to contact Fırat'],
      placeholder: 'Ask a question…',
      send: 'Send',
      close: 'Close',
      note: 'AI can make mistakes. Chats are saved so Fırat can read them.',
      leave: 'Leave Fırat a message',
      cardTitle: 'Your message to Fırat',
      name: 'Your name',
      email: 'Your email',
      message: 'Your message',
      sendCard: 'Send to Fırat',
      cancel: 'Cancel',
      sending: 'Sending…',
      sent: 'Your message is on its way to Fırat. Thank you! He’ll get back to you by email.',
      invalid: 'Please add your name, a valid email address and your message.',
      limited: 'That’s a lot of messages at once. Try again in a few minutes, or leave Fırat a message.',
      full: 'This chat is getting long. You can send your question straight to Fırat.',
      down: 'I can’t answer right now. Would you like to leave Fırat a message?',
      typing: 'Typing',
      privacy: 'Your messages are processed by an AI (Anthropic, USA) and can be read by the site owner. Don’t share sensitive information.',
      privacyLink: 'Privacy',
      privacyHref: '/kvkk/#en',
    },
  }[lang]

  // Project sites get their own assistant, which greets visitors with an offer
  // to explain the project. mfirataksoy.com keeps "Fırat's AI" as above.
  const PROFILES = {
    filmfirtinasi: {
      accent: '#e5484d',
      tr: {
        name: 'Film Fırtınası Asistanı',
        greeting: 'Merhaba 👋 Ne izleyeceğinize karar veremediyseniz yardımcı olabilirim. Size bir film önereyim mi?',
        yes: 'Evet, öner',
        yesMessage: 'Bana bir film önerir misiniz?',
        chips: ['Film nasıl istenir?', 'Puanlar nereden geliyor?'],
      },
      en: {
        name: 'Film Fırtınası Assistant',
        greeting: 'Hi 👋 Can’t decide what to watch? Want me to suggest a film?',
        yes: 'Yes, suggest one',
        yesMessage: 'Could you suggest a film for me?',
        chips: ['How do I request a film?', 'Where do the ratings come from?'],
      },
    },
    acneaway: {
      accent: '#d4574a',
      tr: { name: 'AcneAway Asistanı', what: 'AcneAway’in', chips: ['Nasıl çalışıyordu?', 'Neden emekli oldu?'] },
      en: { name: 'AcneAway Assistant', what: 'AcneAway’s', chips: ['How did it work?', 'Why was it retired?'] },
    },
    notewithme: {
      accent: '#7c8cff',
      delay: 8000, // people come here to write; greet a little later
      tr: {
        name: 'Noteful Asistanı',
        greeting: 'Merhaba 👋 Editörle ilgili yardım lazım olursa buradayım. Kısayolları göstereyim mi?',
        yes: 'Evet, göster',
        yesMessage: 'Editörün kısayollarını gösterir misiniz?',
        chips: ['Notu nasıl paylaşırım?', 'Şifre kilidi nasıl çalışıyor?'],
      },
      en: {
        name: 'Noteful Assistant',
        greeting: 'Hi 👋 Need a hand with the editor? Want me to show you the shortcuts?',
        yes: 'Yes, show me',
        yesMessage: 'Could you show me the editor shortcuts?',
        chips: ['How do I share a note?', 'How does the password lock work?'],
      },
    },
    stickerhub: {
      accent: '#3ecf8e',
      tr: { name: 'StickerHub Asistanı', what: 'StickerHub’ın', chips: ['Botlar nasıl çalışıyordu?', 'Stickerlar neden çizim gibi?'] },
      en: { name: 'StickerHub Assistant', what: 'StickerHub’s', chips: ['How did the bots work?', 'Why do the stickers look drawn?'] },
    },
    'istanbul-etkinlik': {
      accent: '#2b8ad8',
      teaser: false, // the site has its own events assistant; don't pop up next to it
      tr: {
        greeting: 'Merhaba 👋 Sitenin nasıl çalıştığını merak ediyorsanız anlatabilirim. Etkinlik aramak için sitenin kendi “Asistana sor” düğmesini kullanabilirsiniz.',
        yes: 'Nasıl çalışıyor?',
        yesMessage: 'Bu site nasıl çalışıyor?',
        name: 'İstanbul Etkinlik Asistanı', what: 'İstanbul Etkinlik’in', chips: ['Puanlar nasıl veriliyor?', 'Etkinlikler nereden geliyor?'] },
      en: {
        greeting: 'Hi 👋 Curious how this site works? I can explain. To find events, use the site’s own “Asistana sor” button.',
        yes: 'How does it work?',
        yesMessage: 'How does this site work?',
        name: 'Istanbul Etkinlik Assistant', what: 'Istanbul Etkinlik’s', chips: ['How are events scored?', 'Where do the events come from?'] },
    },
  }
  const profile = PROFILES[site]
  if (profile) {
    const p = profile[lang]
    Object.assign(t, lang === 'tr'
      ? {
          launcher: p.name,
          title: p.name,
          subtitle: 'Fırat’ın bir projesi · yapay zekâ asistanı',
          greeting: p.greeting || `Merhaba 👋 Ben ${p.what} asistanıyım. Size bu projeyi açıklamamı ister misiniz?`,
          yes: p.yes || 'Evet, anlatın',
          yesMessage: p.yesMessage || 'Evet, bu projeyi bana anlatır mısınız?',
          later: 'Şimdi değil',
          chips: p.chips,
          note: 'Yapay zekâ hata yapabilir. Sohbetler, projeyi yapan Fırat’ın görmesi için kaydedilir.',
        }
      : {
          launcher: p.name,
          title: p.name,
          subtitle: 'A project by Fırat · AI assistant',
          greeting: p.greeting || `Hi 👋 I’m ${p.what} assistant. Would you like me to explain this project?`,
          yes: p.yes || 'Yes, please',
          yesMessage: p.yesMessage || 'Yes, could you explain this project to me?',
          later: 'Not now',
          chips: p.chips,
          note: 'AI can make mistakes. Chats are saved so Fırat, who built this, can read them.',
        })
  }
  Object.assign(t, lang === 'tr'
    ? { mute: 'Sesi kapat', unmute: 'Sesi aç', dismiss: 'Kapat' }
    : { mute: 'Mute sounds', unmute: 'Turn sounds on', dismiss: 'Dismiss' })

  // Sound: a soft two-note chime made with Web Audio (no file to load).
  // Browsers block audio until the visitor has interacted with the page, so a
  // chime that can't play yet waits for their first click or key press.
  const muteKey = 'firat-chat:muted'
  let muted = data.sound === 'off' || !profile // mfirataksoy.com stays silent
  try {
    const saved = localStorage.getItem(muteKey)
    if (saved !== null && profile) muted = saved === '1'
  } catch {}
  let audio = null
  function chime(kind) {
    if (muted) return
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)()
      if (audio.state === 'running') return play(kind)
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false
      audio.resume().then(() => play(kind), () => {})
      return true
    } catch {
      return false
    }
  }
  function play(kind) {
    try {
      const notes = kind === 'hello' ? [880, 1320] : [1046]
      const start = audio.currentTime + 0.02
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        const at = start + i * 0.12
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(kind === 'hello' ? 0.12 : 0.07, at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35)
        osc.connect(gain).connect(audio.destination)
        osc.start(at)
        osc.stop(at + 0.4)
      })
      return true
    } catch {
      return false
    }
  }

  // State that survives a reload of the same tab.
  let state = { open: false, conversationId: null, log: [] }
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
    if (saved && Array.isArray(saved.log)) state = { ...state, ...saved }
  } catch {}
  const persist = () => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ ...state, log: state.log.slice(-60) }))
    } catch {}
  }

  const host = document.createElement('div')
  host.id = 'firat-chat'
  host.style.cssText = 'position:fixed;z-index:2147483000;inset:auto 0 0 auto;'
  const root = host.attachShadow({ mode: 'open' })
  const accent = /^[#\w(),.%\s-]{1,40}$/.test(data.accent || '') ? data.accent : profile?.accent || '#c8a45d'
  const lift = Math.min(Math.max(Number(data.bottom) || 0, 0), 300)

  root.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; }
  .wrap { --accent: ${accent}; --lift: ${lift}px; --bg: #0b1730; --panel: #0e1c38; --line: rgba(236,231,220,.12);
    --text: #ece7dc; --muted: rgba(236,231,220,.62); --bubble: rgba(236,231,220,.07);
    font: 15px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--text); }
  button { font: inherit; cursor: pointer; }
  .launcher { position: fixed; right: 20px; bottom: calc(20px + var(--lift) + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 10px;
    padding: 12px 18px 12px 14px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 999px;
    background: var(--bg); color: var(--text); box-shadow: 0 10px 30px rgba(0,0,0,.35); transition: transform .15s; }
  .launcher:hover { transform: translateY(-2px); }
  .launcher svg { display: none; }
  .launcher:focus-visible, button:focus-visible, textarea:focus-visible, input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent); }
  .panel { position: fixed; right: 20px; bottom: 20px; width: 380px; height: min(600px, calc(100vh - 40px));
    display: flex; flex-direction: column; background: var(--panel); border: 1px solid var(--line); border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0,0,0,.45); overflow: hidden; }
  .panel[hidden], .launcher[hidden] { display: none; }
  header { display: flex; align-items: center; gap: 12px; padding: 14px 14px 12px 16px; border-bottom: 1px solid var(--line); }
  header .who { flex: 1; min-width: 0; }
  header strong { display: block; font-size: 15px; }
  header span { display: block; font-size: 12.5px; color: var(--muted); }
  .icon { width: 34px; height: 34px; border-radius: 10px; border: 0; background: transparent; color: var(--muted); font-size: 20px; line-height: 1; }
  .icon:hover { background: var(--bubble); color: var(--text); }
  .log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
  .msg { max-width: 88%; padding: 10px 13px; border-radius: 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .msg.bot { background: var(--bubble); border-top-left-radius: 4px; align-self: flex-start; }
  .msg.me { background: var(--accent); color: #0b1730; border-top-right-radius: 4px; align-self: flex-end; }
  .msg.info { align-self: center; background: transparent; color: var(--muted); font-size: 13.5px; text-align: center; }
  .privacy { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.4; padding: 0 2px; }
  .privacy a { color: var(--accent); text-underline-offset: 2px; }
  .sticker { align-self: flex-start; width: 112px; height: 112px; margin: -2px 0 2px 4px; animation: pop .35s cubic-bezier(.3,1.6,.6,1); }
  @keyframes pop { from { transform: scale(.4) rotate(-8deg); opacity: 0 } to { transform: none; opacity: 1 } }
  .msg a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { padding: 7px 12px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--text); font-size: 13.5px; }
  .chip:hover { border-color: var(--accent); }
  .typing { align-self: flex-start; color: var(--muted); font-size: 13px; padding: 4px 2px; }
  .typing i { display: inline-block; width: 5px; height: 5px; margin-left: 3px; border-radius: 50%; background: currentColor; animation: blink 1s infinite; }
  .typing i:nth-child(2) { animation-delay: .2s } .typing i:nth-child(3) { animation-delay: .4s }
  @keyframes blink { 0%, 100% { opacity: .2 } 50% { opacity: 1 } }
  .card { align-self: stretch; border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent); border-radius: 14px; padding: 12px; display: grid; gap: 8px; background: color-mix(in srgb, var(--accent) 6%, transparent); }
  .card strong { font-size: 14px; }
  .card label { display: grid; gap: 3px; font-size: 12.5px; color: var(--muted); }
  .card input, .card textarea, form textarea { width: 100%; font: inherit; font-size: 14px; color: var(--text); background: rgba(0,0,0,.25);
    border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; resize: vertical; }
  .card .row { display: flex; gap: 8px; justify-content: flex-end; }
  .card .err { color: #f0a58a; font-size: 13px; }
  .hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
  .primary { padding: 8px 14px; border-radius: 10px; border: 0; background: var(--accent); color: #0b1730; font-weight: 600; }
  .ghost { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line); background: transparent; color: var(--text); }
  .primary:disabled { opacity: .55; cursor: default; }
  form { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--line); }
  form textarea { flex: 1; resize: none; height: 44px; max-height: 120px; }
  footer { display: flex; justify-content: space-between; gap: 10px; padding: 0 14px 12px; font-size: 11.5px; color: var(--muted); }
  footer button { border: 0; background: none; color: var(--accent); padding: 0; font-size: 12px; white-space: nowrap; }
  .teaser { position: fixed; right: 20px; bottom: calc(84px + var(--lift) + env(safe-area-inset-bottom, 0px)); width: min(320px, calc(100vw - 40px));
    background: var(--panel); border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line)); border-radius: 16px; padding: 14px 14px 12px;
    box-shadow: 0 18px 44px rgba(0,0,0,.4); animation: rise .35s cubic-bezier(.2,1.2,.4,1); }
  .teaser[hidden], .badge[hidden] { display: none; }
  .teaser p { margin: 0 26px 10px 0; }
  .teaser .row { display: flex; gap: 8px; align-items: center; }
  .teaser .row .icon { margin-left: auto; width: 30px; height: 30px; font-size: 16px; }
  .teaser .x { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; font-size: 18px; }
  @keyframes rise { from { transform: translateY(12px) scale(.96); opacity: 0 } to { transform: none; opacity: 1 } }
  .badge { position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
    background: var(--accent); color: #0b1730; font-size: 12px; font-weight: 700; line-height: 20px; text-align: center; }
  .launcher.nudge { animation: nudge .6s ease 2; }
  @keyframes nudge { 0%, 100% { transform: none } 30% { transform: translateY(-4px) rotate(-4deg) } 60% { transform: translateY(-2px) rotate(3deg) } }
  @media (max-width: 480px) {
    .teaser { right: 14px; bottom: calc(76px + var(--lift) + env(safe-area-inset-bottom, 0px)); }
    .panel { inset: 0; width: auto; height: 100%; border-radius: 0; border: 0; }
    /* Phones: a round icon button, so it covers less of the host page. */
    .launcher { right: 14px; bottom: calc(14px + var(--lift) + env(safe-area-inset-bottom, 0px)); width: 52px; height: 52px; padding: 0; justify-content: center; }
    .launcher .dot, .launcher .label { display: none; }
    .launcher svg { display: block; }
    .card input, .card textarea, form textarea { font-size: 16px; } /* no iOS zoom on focus */
  }
  @media (prefers-reduced-motion: reduce) { .launcher, .typing i, .sticker, .teaser { transition: none; animation: none; } }
</style>
<div class="wrap">
  <button class="launcher" type="button" aria-haspopup="dialog"><span class="dot"></span><span class="label"></span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h16v10H9l-4.5 3.5v-3.5H4z"/><circle cx="9" cy="10.5" r=".6" fill="currentColor"/><circle cx="12" cy="10.5" r=".6" fill="currentColor"/><circle cx="15" cy="10.5" r=".6" fill="currentColor"/></svg><span class="badge" hidden>1</span></button>
  <div class="teaser" role="status" hidden>
    <button class="icon x" type="button">×</button>
    <p></p>
    <div class="row"><button class="primary yes" type="button"></button><button class="ghost later" type="button"></button><button class="icon sound" type="button"></button></div>
  </div>
  <section class="panel" role="dialog" aria-modal="false" hidden>
    <header>
      <span class="dot" aria-hidden="true"></span>
      <div class="who"><strong></strong><span></span></div>
      <button class="icon sound" type="button"></button>
      <button class="icon close" type="button">×</button>
    </header>
    <div class="log" aria-live="polite"></div>
    <form>
      <textarea rows="1" maxlength="1000"></textarea>
      <button class="primary" type="submit"></button>
    </form>
    <footer><span class="note"></span><button class="leave" type="button"></button></footer>
  </section>
</div>`

  const $ = (sel) => root.querySelector(sel)
  const launcher = $('.launcher')
  const panel = $('.panel')
  const log = $('.log')
  const form = $('form')
  const input = $('form textarea')
  const sendButton = $('form .primary')

  launcher.querySelector('.label').textContent = t.launcher
  launcher.setAttribute('aria-label', t.launcher)
  panel.setAttribute('aria-label', t.title)
  $('header strong').textContent = t.title
  $('header .who span').textContent = t.subtitle
  $('.close').setAttribute('aria-label', t.close)
  input.placeholder = t.placeholder
  input.setAttribute('aria-label', t.placeholder)
  sendButton.textContent = t.send
  $('.note').textContent = t.note
  $('.leave').textContent = t.leave

  // Text in, safe DOM out: bare URLs and emails become links, nothing else is parsed.
  function linkify(el, text) {
    const pattern = /(https?:\/\/[^\s<>"')]+[^\s<>"').,!?]|[\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi
    let last = 0
    for (const match of text.matchAll(pattern)) {
      el.append(text.slice(last, match.index))
      const a = document.createElement('a')
      const value = match[0]
      a.href = value.includes('@') && !value.startsWith('http') ? `mailto:${value}` : value
      a.textContent = value
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      el.append(a)
      last = match.index + value.length
    }
    el.append(text.slice(last))
  }

  function bubble(kind, text) {
    if (kind === 'sticker') {
      if (!STICKERS.includes(text)) return
      const img = document.createElement('img')
      img.className = 'sticker'
      img.src = `${api}/chat/stickers/${text}.svg`
      img.alt = ''
      log.append(img)
      img.addEventListener('load', () => (log.scrollTop = log.scrollHeight))
      return img
    }
    const el = document.createElement('div')
    el.className = `msg ${kind}`
    linkify(el, text)
    log.append(el)
    log.scrollTop = log.scrollHeight
    return el
  }

  function add(kind, text) {
    state.log.push({ kind, text })
    persist()
    bubble(kind, text)
  }

  function renderChips() {
    const chips = document.createElement('div')
    chips.className = 'chips'
    const options = t.yes ? [[t.yes, t.yesMessage], ...t.chips.map((c) => [c, c])] : t.chips.map((c) => [c, c])
    for (const [label, message] of options) {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'chip'
      chip.textContent = label
      chip.addEventListener('click', () => {
        chips.remove()
        ask(message)
      })
      chips.append(chip)
    }
    log.append(chips)
  }

  // KVKK: said once, before the visitor writes anything. The link goes to the
  // notice of the site the widget is embedded on.
  function renderPrivacy() {
    const p = document.createElement('p')
    p.className = 'privacy'
    const a = document.createElement('a')
    a.href = location.origin + t.privacyHref
    a.target = '_blank'
    a.rel = 'noopener'
    a.textContent = t.privacyLink
    p.append(t.privacy + ' ', a)
    log.append(p)
  }

  function renderLog() {
    log.textContent = ''
    bubble('bot', t.greeting)
    if (!state.log.length) renderPrivacy()
    for (const entry of state.log) bubble(entry.kind, entry.text)
    if (!state.log.length) renderChips()
  }

  let busy = false
  async function post(path, body) {
    const res = await fetch(`${api}${path}?site=${encodeURIComponent(site)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, lang, page: location.pathname }),
    })
    let payload = {}
    try {
      payload = await res.json()
    } catch {}
    return { status: res.status, ...payload }
  }

  async function ask(text) {
    text = text.trim().slice(0, 1000)
    if (!text || busy) return
    busy = true
    sendButton.disabled = true
    root.querySelector('.chips')?.remove()
    add('me', text)
    const typing = document.createElement('div')
    typing.className = 'typing'
    typing.append(t.typing, document.createElement('i'), document.createElement('i'), document.createElement('i'))
    log.append(typing)
    log.scrollTop = log.scrollHeight
    try {
      const res = await post('/api/chat', { message: text, conversationId: state.conversationId })
      if (res.conversationId) state.conversationId = res.conversationId
      if (res.status === 200 && res.reply) {
        add('bot', res.reply)
        chime('reply')
        if (res.sticker) add('sticker', res.sticker)
        if (res.draft) contactCard(res.draft)
      } else if (res.status === 429) {
        add('info', res.error === 'conversation_full' ? t.full : t.limited)
        contactCard({})
      } else {
        add('info', t.down)
        contactCard({})
      }
    } catch {
      add('info', t.down)
      contactCard({})
    } finally {
      typing.remove()
      busy = false
      sendButton.disabled = false
      persist()
    }
  }

  // The visitor reviews (and can edit) the message before anything is sent.
  function contactCard(draft) {
    root.querySelector('.card')?.remove()
    const card = document.createElement('div')
    card.className = 'card'
    const title = document.createElement('strong')
    title.textContent = t.cardTitle
    const field = (labelText, tag, value, type) => {
      const label = document.createElement('label')
      const control = document.createElement(tag)
      if (type) control.type = type
      control.value = value || ''
      control.maxLength = tag === 'textarea' ? 3000 : 200
      if (tag === 'textarea') control.rows = 4
      label.append(labelText, control)
      return { label, control }
    }
    const name = field(t.name, 'input', draft.name, 'text')
    const email = field(t.email, 'input', draft.email, 'email')
    const message = field(t.message, 'textarea', draft.message)
    const honeypot = document.createElement('input')
    honeypot.className = 'hp'
    honeypot.tabIndex = -1
    honeypot.autocomplete = 'off'
    honeypot.setAttribute('aria-hidden', 'true')
    const err = document.createElement('div')
    err.className = 'err'
    const row = document.createElement('div')
    row.className = 'row'
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'ghost'
    cancel.textContent = t.cancel
    const submit = document.createElement('button')
    submit.type = 'button'
    submit.className = 'primary'
    submit.textContent = t.sendCard
    row.append(cancel, submit)
    card.append(title, name.label, email.label, message.label, honeypot, err, row)
    log.append(card)
    log.scrollTop = log.scrollHeight
    ;(draft.name ? submit : name.control).focus()

    cancel.addEventListener('click', () => card.remove())
    submit.addEventListener('click', async () => {
      const body = {
        name: name.control.value.trim(),
        email: email.control.value.trim(),
        message: message.control.value.trim(),
        website: honeypot.value,
        conversationId: state.conversationId,
      }
      if (!body.name || !body.message || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(body.email)) {
        err.textContent = t.invalid
        return
      }
      submit.disabled = true
      submit.textContent = t.sending
      err.textContent = ''
      try {
        const res = await post('/api/contact', body)
        if (res.status !== 200) throw new Error(String(res.status))
        card.remove()
        add('info', t.sent)
        add('sticker', 'party')
      } catch (e) {
        err.textContent = String(e.message) === '429' ? t.limited : t.down
        submit.disabled = false
        submit.textContent = t.sendCard
      }
    })
  }

  function setOpen(open) {
    hideTeaser()
    state.open = open
    persist()
    panel.hidden = !open
    launcher.hidden = open
    launcher.setAttribute('aria-expanded', String(open))
    if (open) {
      if (!log.childElementCount) renderLog()
      log.scrollTop = log.scrollHeight
      input.focus()
    } else {
      launcher.focus()
    }
  }

  // Mute toggles, in the panel header and on the greeting bubble.
  const bell = (on) =>
    on
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M3 3l18 18"/></svg>'
  function renderSound() {
    for (const b of root.querySelectorAll('.sound')) {
      b.innerHTML = bell(!muted)
      b.setAttribute('aria-label', muted ? t.unmute : t.mute)
      b.title = muted ? t.unmute : t.mute
      b.setAttribute('aria-pressed', String(muted))
    }
  }
  for (const b of root.querySelectorAll('.sound')) {
    b.addEventListener('click', () => {
      muted = !muted
      try {
        localStorage.setItem(muteKey, muted ? '1' : '0')
      } catch {}
      renderSound()
      if (!muted) chime('reply')
    })
  }
  renderSound()
  if (!profile) $('header .sound').hidden = true

  // The greeting bubble: project sites only, once per visit, after a short pause.
  const teaser = $('.teaser')
  const badge = $('.badge')
  const teaserKey = `${storageKey}:teaser`
  function hideTeaser(forGood) {
    teaser.hidden = true
    badge.hidden = true
    if (forGood) {
      try {
        sessionStorage.setItem(teaserKey, '1')
      } catch {}
    }
  }
  function showTeaser() {
    if (state.open || state.log.length) return
    try {
      if (sessionStorage.getItem(teaserKey)) return
    } catch {}
    teaser.querySelector('p').textContent = t.greeting
    teaser.hidden = false
    badge.hidden = false
    launcher.classList.add('nudge')
    if (chime('hello') === false && !muted) {
      // Not allowed to play yet: chime on the visitor's first interaction, if the bubble is still up.
      const later = () => {
        window.removeEventListener('pointerdown', later, true)
        window.removeEventListener('keydown', later, true)
        if (!teaser.hidden) setTimeout(() => chime('hello'), 0)
      }
      window.addEventListener('pointerdown', later, true)
      window.addEventListener('keydown', later, true)
    }
  }
  if (profile) {
    teaser.querySelector('.yes').textContent = t.yes
    teaser.querySelector('.later').textContent = t.later
    teaser.querySelector('.x').setAttribute('aria-label', t.dismiss)
    teaser.querySelector('.yes').addEventListener('click', () => {
      hideTeaser(true)
      setOpen(true)
      ask(t.yesMessage)
    })
    teaser.querySelector('.later').addEventListener('click', () => hideTeaser(true))
    teaser.querySelector('.x').addEventListener('click', () => hideTeaser(true))
    const delay = data.delay !== undefined && Number(data.delay) >= 0 ? Number(data.delay) : profile.delay || 3500
    if (profile.teaser !== false) setTimeout(showTeaser, delay)
  }

  launcher.addEventListener('click', () => {
    hideTeaser(true)
    setOpen(true)
  })
  $('.close').addEventListener('click', () => setOpen(false))
  $('.leave').addEventListener('click', () => contactCard({}))
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = input.value
    input.value = ''
    ask(text)
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault()
      form.requestSubmit()
    }
  })

  const mount = () => {
    document.body.append(host)
    if (state.open) setOpen(true)
  }
  if (document.body) mount()
  else document.addEventListener('DOMContentLoaded', mount)
})()
