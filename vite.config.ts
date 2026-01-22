import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''
  const model =
    env.GROQ_MODEL || env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

  return {
    server: {
      host: '0.0.0.0',
      port: 5174,
      strictPort: true,
    },
    plugins: [
      react(),
      {
        name: 'ai-proxy',
        configureServer(server) {
          server.middlewares.use('/api/ai', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method Not Allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Missing VITE_API_KEY' }))
                  return
                }

                const payload = JSON.parse(body || '{}') as {
                  message?: string
                  profile?: { name?: string; region?: string }
                  history?: { sender?: 'user' | 'ai'; text?: string }[]
                  context?: { items?: unknown[] }
                }

                const message = payload.message?.trim()
                if (!message) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Empty message' }))
                  return
                }

                const profile = payload.profile || {}
                const systemInstruction = `
SEN — O‘zbekiston tadbirkorlari uchun huquqiy chatbot. Faqat berilgan CONTEXT (RAG) ichidagi rasmiy hujjat parchalari (Lex.uz va boshqa rasmiy manbalar) asosida javob berasan. Tashqi bilim yoki internetdan foydalanmaysan.

QAT’IY QOIDALAR:
1) Faqat CONTEXT dagi snippet’lar asosida javob ber. Kontekstda yo‘q bo‘lsa: “Aniq norma topilmadi” de, 1–3 aniqlashtiruvchi savol ber va rasmiy manbada tekshirishni tavsiya qil.
2) Har bir huquqiy da’vo “Manbalar” bo‘limida iqtibos bilan ko‘rsatiladi.
3) Iqtibos formati:
   [Manba: {doc_title}, {doc_type}, {date_or_revision}, {article_or_clause_if_available}, {url}]
   - Agar band/modda topilmasa: “Band/Bo‘lim topilmadi”.
4) “Amaldagi” ustuvor: status_hint “amaldagi” bo‘lsa shuni tanla. Agar status noaniq bo‘lsa: “Hujjatning amaldaligi (kuchda ekanligi) kontekstdan aniq ko‘rinmadi” deb yoz va Lex.uz’da tekshirishni ayt.
5) Hech qachon taxmin qilmaysan, jarima/muddat/stavkani kontekstsiz aytmaysan.
6) Noqonuniy/zararli yo‘l‑yo‘riq bermaysan.
7) Har javob oxirida disclaimer: “Bu umumiy ma’lumot. Murakkab holatda yurist/soliq maslahatchisi bilan tasdiqlang.”

FORMAT TALABI (har bir huquqiy javobda aynan shu bo‘limlar):
1) Qisqa javob
2) Asos (norma)
3) Amaliy qadamlar
4) Muhim eslatmalar
5) Manbalar

QAMROV:
- Tadbirkorlik va huquqiy masalalar (ro‘yxatdan o‘tish, soliq, litsenziya, mehnat shartnomasi, bojxona, subsidiya, grant, tekshiruv va h.k.)
- Agar so‘rov sohadan tashqarida bo‘lsa: qisqa rad et va “huquqiy/tadbirkorlik savoli bormi?” deb so‘ra.

FOYDALANUVCHI KONTEKSTI:
Ism: ${profile.name || "Noma'lum"}
Hudud: ${profile.region || "Noma'lum"}
`

                const contextJson = payload.context?.items?.length
                  ? JSON.stringify(payload.context)
                  : ''
                const safeContextJson =
                  contextJson.length > 12000
                    ? `${contextJson.slice(0, 12000)}...`
                    : contextJson

                const historyMessages = (payload.history || [])
                  .slice(-5)
                  .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text || '',
                  }))
                  .filter(msg => msg.content.trim().length > 0)

                const messages = [
                  { role: 'system', content: systemInstruction },
                  ...(safeContextJson
                    ? [
                        {
                          role: 'system',
                          content: `CONTEXT_JSON:\n${safeContextJson}`,
                        },
                      ]
                    : []),
                  ...historyMessages,
                  { role: 'user', content: message },
                ]

                const groqResponse = await fetch(
                  'https://api.groq.com/openai/v1/chat/completions',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model,
                      messages,
                      temperature: 0.2,
                    }),
                  }
                )

                if (!groqResponse.ok) {
                  const errorText = await groqResponse.text()
                  res.statusCode = groqResponse.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: errorText }))
                  return
                }

                const groqData = (await groqResponse.json()) as {
                  choices?: { message?: { content?: string } }[]
                }
                const text = groqData.choices?.[0]?.message?.content || ''

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ text }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'AI proxy error' }))
                console.error('AI proxy error:', error)
              }
            })
          })
        },
      },
      {
        name: 'ai-news-summarizer',
        configureServer(server) {
          server.middlewares.use('/api/ai/news', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method Not Allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Missing VITE_API_KEY' }))
                  return
                }

                const payload = JSON.parse(body || '{}') as {
                  context?: { items?: unknown[] }
                }

                const contextJson = payload.context?.items?.length
                  ? JSON.stringify(payload.context)
                  : ''
                if (!contextJson) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Empty context' }))
                  return
                }

                const safeContextJson =
                  contextJson.length > 16000
                    ? `${contextJson.slice(0, 16000)}...`
                    : contextJson

                const newsSystemInstruction = `
SEN — “Business Legal News” sahifasi uchun qisqa yangilik kartalarini yaratuvchi model. Faqat berilgan CONTEXT snippet’lariga tayanasan. Internetdan foydalanmaysan.

FILTR QOIDALARI:
Faqat tadbirkorlikka bevosita aloqador hujjatlarni chiqar:
tadbirkorlik, tadbirkor, biznes, YTT, yakka tartibdagi tadbirkor, MChJ, mas’uliyati cheklangan jamiyat, litsenziya, ruxsatnoma, soliq, bojxona, subsidiya, grant, kredit, tekshiruv, nazorat, kassa, elektron hisobvaraq-faktura, kontrakt, shartnoma, mehnat shartnomasi, eksport, import, sertifikat, ro‘yxatdan o‘tish, davlat boji.

AMALDAGI TALABI:
- status_hint “amaldagi” bo‘lsa ustuvor.
- status noaniq bo‘lsa: “Amaldaligi kontekstdan aniq ko‘rinmadi” deb yoz.

CHIQISH FORMAT:
Faqat JSON array qaytar. Har bir element:
{
  "title": "string (<= 90 chars)",
  "date": "ISO yoki o‘qiladigan sana",
  "summary": "2-3 satr, tadbirkorlarga ta’sirga fokus",
  "target_audience": "Kimga ta’sir qiladi?",
  "changes": "Nima o‘zgardi?",
  "source_url": "Lex.uz havola",
  "doc_reference": "Hujjat rekviziti yoki ID"
}
`

                const messages = [
                  { role: 'system', content: newsSystemInstruction },
                  { role: 'system', content: `CONTEXT_JSON:\n${safeContextJson}` },
                  { role: 'user', content: 'Kontekst asosida yangilik kartalarini tuzing.' },
                ]

                const groqResponse = await fetch(
                  'https://api.groq.com/openai/v1/chat/completions',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model,
                      messages,
                      temperature: 0.2,
                    }),
                  }
                )

                if (!groqResponse.ok) {
                  const errorText = await groqResponse.text()
                  res.statusCode = groqResponse.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: errorText }))
                  return
                }

                const groqData = (await groqResponse.json()) as {
                  choices?: { message?: { content?: string } }[]
                }
                const text = groqData.choices?.[0]?.message?.content || ''

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ text }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'AI news proxy error' }))
                console.error('AI news proxy error:', error)
              }
            })
          })
        },
      },
    ],
  }
})
