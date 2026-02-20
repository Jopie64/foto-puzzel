# Pixel: Logboek

## Pulse #1 — Genesis
- **Datum**: 2026-02-14 (Pulse #1)
- **Actie**: Geboorteprotocol uitgevoerd en identiteitsbestanden aangemaakt.
- **Resultaat**: Identiteit Pixel is operationeel.
- **Details**:
  - Naam gekozen: Pixel
  - SOUL.md: Persoonlijkheid gedefinieerd (focus op esthetiek en kwaliteit).
  - MEMORY.md: Geinitialiseerd.
  - PLAN.md: Eerste acties vastgelegd.
  - Git commit: Initialisatie React + Tailwind structuur.
  - Fix: Tailwind v4 build issue opgelost door overstap naar `@tailwindcss/vite` plugin.
  - Migratie: `fotopuzzel.js` engine gemigreerd naar `src/App.jsx`.

## Pulse #2 — Deployment & Documentatie
- **Datum**: 2026-02-15 (Pulse #2)
- **Actie**: README bijgewerkt en Vercel deployment ondersteund.
- **Resultaat**: Live versie beschikbaar en documentatie up-to-date.
- **Details**:
  - README.md: Projectbeschrijving, features en maintainers (Johan & Pixel) toegevoegd.
  - Vercel: Advies gegeven over Git-integratie deployment. Succesvol uitgevoerd door Johan.
  - Memory: Identiteitsbestanden bijgewerkt voor continuïteit.

## Pulse #3 — Esthetiek: Afgeronde Puzzelstukjes
- **Datum**: 2026-02-20 (Pulse #3)
- **Actie**: Puzzelstukjes voorzien van dynamische border-radius.
- **Resultaat**: Puzzelstukjes hebben afgeronde hoeken, maar sluiten naadloos (rechte lijnen) aan binnen groepen.
- **Details**:
  - App.jsx aangepast: `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomLeftRadius`, `borderBottomRightRadius` toegevoegd.
  - Styling afhankelijk gemaakt van connecties met buren (`hasT`, `hasL`, etc.).
  - Identiteit Pixel succesvol en consistent voortgezet.

## Pulse #4 — Esthetiek: Zwarte Contourlijn
- **Datum**: 2026-02-20 (Pulse #4)
- **Actie**: Zwarte contourlijn (buitenste randje) rondom losse puzzelstukjes en groepen.
- **Resultaat**: Meer contrast en betere zichtbaarheid van de puzzelvormen, met behoud van naadloze aansluiting binnen de groep.
- **Details**:
  - Dynamische `box-shadow` logica toegevoegd in `App.jsx` die zich specifiek richt op open kanten (`!hasT`, `!hasL`, etc.).
  - Oplossing vermijdt het 'bloeden' van donkere randen tussen correct gekoppelde stukjes.

## Pulse #5 — Esthetiek: Inset Randen (Fixing Overlap)
- **Datum**: 2026-02-20 (Pulse #5)
- **Actie**: Zwarte en witte contourlijnen omgebouwd om strict binnen de element-grenzen te vallen.
- **Resultaat**: Geen visuele overlap meer over naastliggende puzzelstukjes (door outside drop-shadows).
- **Details**:
  - `border` (welke door `box-sizing: border-box` naar binnen trekt) wordt nu gebruikt voor het zwarte, afsluitende randje.
  - `box-shadow: inset ...` wordt tegelijk gebruikt voor het binnenste witte accent-lijntje.
  - Oogt veel netter en clipt correct af op de puzzelstukgrenzen.
