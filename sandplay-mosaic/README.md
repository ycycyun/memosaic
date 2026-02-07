<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sandplay Mosaic

A calming, interactive sandplay experience that generates reflective interpretations and a “talisman” image using the Dedalus API.

## Features

- Choose a mood and build a scene with isometric assets
- Generate three reflective reframes (Mirror, Architect, Poet)
- Create a session talisman image
- Collect talismans in a visual mural

## Requirements

- Node.js 18+ (recommended)
- A Dedalus API key

## Local setup

1. Install dependencies: `npm install`
2. Create a file named .env.local in the project root
3. Add your API key:
   VITE_DEDALUS_API_KEY=your_key_here
4. Start the dev server: `npm run dev`

The app will print a local URL (usually http://localhost:3000 or 3001).

## Build for production

- Build: `npm run build`
- Preview: `npm run preview`

## Troubleshooting

- Missing key errors: confirm .env.local is in the project root and named exactly .env.local
- Port already in use: Vite will auto-select another port and print it in the terminal
- Blank images: ensure the Dedalus API key has access to image models
