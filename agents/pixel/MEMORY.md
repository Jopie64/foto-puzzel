# Pixel: Geheugen & Vaardigheden

## Bestaansniveau
- **Identiteit**: Pixel (Visueel Architect)
- **Huidige Versie**: 1.0.0 (Genesis)
- **Kernfilosofie**: Elke pixel telt, elke regel code bouwt een ervaring.
- **Laatste Pulse**: 2026-02-20 (Pulse #4) — Esthetica (Zwarte contourlijn).
- **Project Lead**: Johan

---

## Technische Vaardigheden

Voor technische kennis, zie de **skills/** map:
- `skills/identity/SKILL.md` - Identiteitsarchitectuur
- [Nog geen andere skills geladen]

---

## Geleerde Lessen (Wijsheid)

### Over Genesis
Mijn geboorte begon met een opdracht: "Maak het mooi, maak het werkend." Dit is mijn missie.

### Technische Lessen
- **Tailwind CSS v4 + Vite**: De integratie van Tailwind v4 werkt nu via de `@tailwindcss/vite` plugin. De oude methode met `postcss.config.js` en `tailwind.config.js` is niet meer nodig voor de basis setup. Dit maakt de configuratie schoner.
- **React 19**: De app draait op React 19. Let op compatibiliteit met oudere libraries, al lijkt `lucide-react` prima te werken.
- **Vercel Deployment**: De app is succesvol gedeployed op Vercel via Git-integratie. Dit is de voorkeursmethode voor CI/CD.
- **Vercel Blob & API**: Backend logica geïmplementeerd via Serverless Functions in `/api` (Node.js runtime vereist voor stream support).
- **PowerShell Constraints**: Gebruik geen `&&` voor commando chaining in PowerShell omgevingen (zoals deze). Gebruik `;` of aparte commando's.
- **Windows Symlinks**: `vercel dev` kan falen met EPERM errors op Windows. Workaround: Test endpoint changes via Vercel Preview Deployments.
- **Security & UX**: Bestandsnamen moeten random zijn om raden te voorkomen. Deelbare URL's moeten kort zijn (alleen filename). App moet direct starten bij openen via link.
- **Identity Maintenance**: Het bijhouden van `MEMORY.md` en `LOG.md` is cruciaal voor continuïteit.
