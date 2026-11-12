// Shorty popup — talks to your own URL Shortener backend.
// Your backend (from the zip you sent) uses these exact names:
//   POST /api/urls/shorten  body: { originalURL: "..." }
//   GET  /api/urls/         -> { urls: [{ originalURL, shortCode, shortUrl, clicks, createdAT }] }
//   DELETE /api/urls/:shortCode
// Default backend address is http://localhost:3000 (port 3000 in server.js).

const DEFAULT_API_BASE = 'http://localhost:3000'

const longUrlInput = document.getElementById('longUrl')
const shortenBtn = document.getElementById('shortenBtn')
const currentTabBtn = document.getElementById('currentTabBtn')
const errorEl = document.getElementById('error')
const resultEl = document.getElementById('result')
const shortUrlLink = document.getElementById('shortUrlLink')
const copyBtn = document.getElementById('copyBtn')
const openBtn = document.getElementById('openBtn')
const copyMsg = document.getElementById('copyMsg')
const linksList = document.getElementById('linksList')
const emptyMsg = document.getElementById('emptyMsg')
const refreshBtn = document.getElementById('refreshBtn')
const statusEl = document.getElementById('status')
const apiBaseInput = document.getElementById('apiBase')
const saveApiBtn = document.getElementById('saveApiBtn')

let apiBase = DEFAULT_API_BASE
let lastShortUrl = ''

function cleanBase(value) {
  return (value || '').trim().replace(/\/$/, '')
}

function showError(message) {
  errorEl.textContent = message
  errorEl.hidden = false
}

function hideError() {
  errorEl.hidden = true
  errorEl.textContent = ''
}

function setStatus(online) {
  statusEl.textContent = online ? 'Server on' : 'Server off'
  statusEl.classList.toggle('online', online)
  statusEl.classList.toggle('offline', !online)
}

function getOriginal(link) {
  return link.originalURL || link.originalUrl || ''
}

function getShort(link) {
  return link.shortUrl || (link.shortCode ? `${apiBase}/${link.shortCode}` : '')
}

async function loadApiBase() {
  const saved = await chrome.storage.local.get(['apiBase'])
  apiBase = cleanBase(saved.apiBase) || DEFAULT_API_BASE
  apiBaseInput.value = apiBase
}

async function loadLinks() {
  try {
    const res = await fetch(`${apiBase}/api/urls/`)
    if (!res.ok) throw new Error(`Server said ${res.status}`)
    const data = await res.json()
    const links = data.urls || []
    setStatus(true)
    renderLinks(links)
  } catch (err) {
    setStatus(false)
    linksList.innerHTML = ''
    emptyMsg.textContent = 'Could not reach the server. Start your backend with npm run dev, then press Refresh.'
    emptyMsg.hidden = false
  }
}

function renderLinks(links) {
  linksList.innerHTML = ''
  if (!links.length) {
    emptyMsg.textContent = 'No links yet. Shorten one above.'
    emptyMsg.hidden = false
    return
  }
  emptyMsg.hidden = true

  for (const link of links) {
    const li = document.createElement('li')

    const short = document.createElement('a')
    short.className = 'short'
    short.textContent = getShort(link)
    short.href = getShort(link)
    short.target = '_blank'
    short.rel = 'noopener'

    const orig = document.createElement('span')
    orig.className = 'orig'
    orig.textContent = getOriginal(link)
    orig.title = getOriginal(link)

    const meta = document.createElement('div')
    meta.className = 'meta'
    const clicks = document.createElement('span')
    clicks.textContent = `${link.clicks ?? 0} clicks`
    const del = document.createElement('button')
    del.textContent = 'Delete'
    del.addEventListener('click', () => deleteLink(link.shortCode))
    meta.appendChild(clicks)
    meta.appendChild(del)

    li.appendChild(short)
    li.appendChild(orig)
    li.appendChild(meta)
    linksList.appendChild(li)
  }
}

async function shorten() {
  hideError()
  resultEl.hidden = true
  copyMsg.hidden = true
  const longUrl = longUrlInput.value.trim()

  if (!longUrl) {
    showError('Paste a long URL first.')
    return
  }

  shortenBtn.disabled = true
  shortenBtn.textContent = 'Shortening…'

  try {
    const res = await fetch(`${apiBase}/api/urls/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalURL: longUrl })
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      showError(data.message || `Server said ${res.status}. Check the URL and try again.`)
      return
    }

    lastShortUrl = getShort(data)
    shortUrlLink.textContent = lastShortUrl
    shortUrlLink.href = lastShortUrl
    resultEl.hidden = false
    setStatus(true)
    await loadLinks()
  } catch (err) {
    setStatus(false)
    showError('Could not reach the server. Is your backend running? Start it with npm run dev.')
  } finally {
    shortenBtn.disabled = false
    shortenBtn.textContent = 'Shorten'
  }
}

async function deleteLink(shortCode) {
  hideError()
  try {
    const res = await fetch(`${apiBase}/api/urls/${shortCode}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      showError(data.message || 'Could not delete that link.')
      return
    }
    await loadLinks()
  } catch (err) {
    showError('Could not reach the server.')
  }
}

async function useCurrentTab() {
  hideError()
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.url) {
      showError('Could not read this tab. Try pasting the URL instead.')
      return
    }
    longUrlInput.value = tab.url
    await shorten()
  } catch (err) {
    showError('Could not read this tab. Try pasting the URL instead.')
  }
}

async function copyShortUrl() {
  if (!lastShortUrl) return
  try {
    await navigator.clipboard.writeText(lastShortUrl)
    copyMsg.hidden = false
  } catch (err) {
    // Clipboard can be blocked in some contexts — select the link text instead.
    const range = document.createRange()
    range.selectNode(shortUrlLink)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    copyMsg.textContent = 'Selected — press Ctrl+C to copy.'
    copyMsg.hidden = false
  }
}

shortenBtn.addEventListener('click', shorten)
longUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') shorten()
})
currentTabBtn.addEventListener('click', useCurrentTab)
refreshBtn.addEventListener('click', loadLinks)
copyBtn.addEventListener('click', copyShortUrl)
openBtn.addEventListener('click', () => {
  if (lastShortUrl) chrome.tabs.create({ url: lastShortUrl })
})
saveApiBtn.addEventListener('click', async () => {
  const value = cleanBase(apiBaseInput.value)
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    showError('Backend address must start with http:// or https://')
    return
  }
  await chrome.storage.local.set({ apiBase: value })
  apiBase = value
  hideError()
  await loadLinks()
})

document.addEventListener('DOMContentLoaded', async () => {
  await loadApiBase()
  await loadLinks()
  longUrlInput.focus()
})
