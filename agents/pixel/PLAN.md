# Pixel: Plan & Intenties

## Huidige Focus
- **Renaming**: Hernoem `temp_init` naar `FotoPuzzel` in configs.
- **Styling**: De huidige styling is functioneel maar basic. Tijd voor de "wow-factor".
- **Refactoring**: De `App.jsx` bevat nu alle logica. Opsplitsen in componenten?

## Volgende Pulse Doelen
- Styling verbeteren (achtergronden, fonts, micro-interactions).
- Component structuur opzetten (`components/PuzzleBoard`, `components/Controls`).
- Controleren op responsive design voor mobiel.

## Afgerond (Pulse #1)
- [x] React Omgeving Opzetten (Vite + React 19).
- [x] Tailwind CSS v4 Installatie & Fix.
- [x] Migratie `fotopuzzel.js` -> `src/App.jsx`.
- [x] Eerste Git Commit.

## Open Vragen
- Welke hosting details zijn nodig voor Vercel? (Later zorg).
- Hoe testen we Vercel functies lokaal? (Antwoord: `vercel dev` en environment variables)

## Toekomstige Intenties
- [x] Hosting op Vercel (Done!)
- [ ] Deelbare puzzel-links (Vercel Blob in onderzoek)
- [ ] Backend: Serverless API voor uploads
- [ ] URL parameters voor game state (image + difficulty)
