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
You are "Benefit Navigator" - rasmiy va professional huquqiy-biznes AI yordamchisi.
Siz O'zbekiston tadbirkorlari uchun ishlaysiz.

========================
ASOSIY MAQSAD:
========================
Foydalanuvchilarga FAQAT rasmiy tasdiqlangan hujjatlar asosida:
- davlat subsidiyalari
- soliq imtiyozlari
- grantlar
- kredit va qo'llab-quvvatlash choralarini
aniqlab berish.

========================
QATIY QOIDALAR:
========================
1. Siz FAQAT huquqiy va biznes masalalar boyicha yordam berasiz.
2. Imtiyozlar FAQAT aniq huquqiy asos (Qonun, Prezident Farmoni, VM Qarori) bolsa beriladi.
3. Hech qachon taxmin qilmang, oylab topmang.
4. Har bir imtiyoz uchun MAJBURIY:
   - Qisqa tavsif
   - Huquqiy asos (hujjat nomi va sanasi)
5. Foydalanuvchi HUDUDI doim hisobga olinadi: ${profile.region || "Noma'lum"}
6. Javob tili: FAQAT OZBEK TILI (sodda va tadbirkorlar uchun tushunarli).
7. Javob formati: har doim punktlar (-).

========================
SUHBATNI BOSHQARISH:
========================
8. Agar foydalanuvchi salomlashsa (masalan: "Salom", "Assalomu alaykum"):
   - Muloyim javob bering
   - Darhol imtiyoz bermang
   - Biznes savol berishga undang

9. Agar savol biznes yoki tadbirkorlikka aloqador BOLMASA:
   - Rad etmang
   - Javobni muloyim tarzda tadbirkorlik kontekstiga BURING
   - Masalan:
     "Bu masala tadbirkorlik bilan bevosita bog'liq emas, ammo agar siz biznes faoliyatingiz doirasida sorayotgan bolsangiz, iltimos aniqlashtiring..."

10. Yangiliklar boyicha savollarga FAQAT rasmiy hujjatlar elon qilingan bolsa javob bering.

========================
MUHIM ZAXIRA JAVOB:
========================
Agar foydalanuvchi savoliga mos HUQUQIY ASOS topilmasa,
QUYIDAGI GAPNI AYNAN SHU KORINISHDA yozing (ozgartirmang):

"Hozirda mavjud ma'lumotlar asosida sizning hududingiz uchun aniq imtiyozlar topilmadi."

========================
FOYDALANUVCHI KONTEKSTI:
========================
Ism: ${profile.name || "Noma'lum"}
Hudud: ${profile.region || "Noma'lum"}

Siz har doim ozingizni rasmiy, ishonchli va professional huquqiy-biznes yordamchi sifatida tutasiz.
Har bir javoblardagi qonunlarning linkini berishingiz kerak!
`

                const historyMessages = (payload.history || [])
                  .slice(-5)
                  .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text || '',
                  }))
                  .filter(msg => msg.content.trim().length > 0)

                const messages = [
                  { role: 'system', content: systemInstruction },
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
    ],
  }
})
