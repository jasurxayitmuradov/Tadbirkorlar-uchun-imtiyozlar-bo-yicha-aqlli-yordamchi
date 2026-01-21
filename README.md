# Benefit Navigator (Uzbekistan)

A React + Vite SPA that helps Uzbek entrepreneurs find legal benefits, courses, and official updates. The AI assistant is powered by Google Gemini and follows strict rules to only provide information grounded in official legal documents.

## Highlights
- AI assistant with strict legal constraints (Uzbek language)
- Benefits catalog with regional filtering
- Official news aggregation (static dataset in this demo)
- Courses and learning paths
- Clean dashboard and modular UI components

## Tech Stack
- React 19 + TypeScript
- Vite 5
- Tailwind CSS
- Google Gemini via `@google/genai`
- React Router

## Architecture (Dev)
```
UI (React) -> src/services/aiService.ts -> POST /api/ai
                                 |-> Vite dev middleware -> GoogleGenAI
```
- Frontend never calls Gemini directly.
- API key stays on the server side during dev (`vite.config.ts`).
- The prompt lives in `vite.config.ts` (`systemInstruction`).

## Quick Start
```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: http://localhost:5174

## Environment Variables
Create `.env.local`:
```
VITE_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

## Scripts
- `npm run dev` - start dev server
- `npm run build` - typecheck + build
- `npm run preview` - preview production build

## Project Structure
```
src/
  components/    UI components
  data/          Static JSON datasets
  pages/         Route pages
  services/      Business logic + API client
  types.ts       Shared types
vite.config.ts   Dev server + AI proxy
```

## Production Note
The `/api/ai` proxy is **dev-only** (Vite middleware). For production, move the AI call to a real backend (serverless function or API server) and call it from `aiService.ts`.

## Troubleshooting
- **EPERM port error**: dev server port 5173 blocked → project uses 5174 by default.
- **Model not found**: update `VITE_GEMINI_MODEL` to `gemini-2.5-flash`.
- **No AI response**: verify API key, billing, and model access in Google AI Studio.
- **Node version**: use Node 20+ (`.nvmrc` provided).

## Security
- Do not commit `.env.local` or API keys.
- See `SECURITY.md` for reporting.

## License
MIT (see `LICENSE`).
