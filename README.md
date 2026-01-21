# Benefit Navigator (Uzbekistan)

A React 19 SPA for Uzbek entrepreneurs to find legal benefits, courses, and official news.

## Features
- **AI Chat**: Powered by Google Gemini (`gemini-3-flash-preview`).
- **Courses**: Educational content aggregation with learning paths.
- **Benefits Catalog**: Searchable database of subsidies and tax breaks.
- **Design**: "Ion Theme" - Dark mode, glassmorphism, responsive.

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_google_genai_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure
- `src/services`: Logic for AI, News, Benefits, Courses.
- `src/data`: Static JSON datasets (simulating backend).
- `src/components`: Reusable UI (Card, Sidebar, etc.).
- `src/pages`: Main route views.

## Technology
- React 19
- TypeScript
- Tailwind CSS (via CDN for simplicity in this artifact, but configured for PostCSS in files)
- @google/genai SDK
