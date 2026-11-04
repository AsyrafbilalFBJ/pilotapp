# Susi Air Pilot App — Frontend (Nuxt 3)

Nuxt 3 version of the frontend. Pages, components, composables, stores and styles are the same as in [`../nuxt`](../nuxt) (Nuxt 4); only the framework version and the folder layout differ.

| | `nuxt/` | `nuxt3/` |
| --- | --- | --- |
| Nuxt | 4.6.3 | 3.21.11 |
| Source folders | inside `app/` | at the project root (standard Nuxt 3 layout) |
| Pinia | `pinia` 4 + `@pinia/nuxt` 1.0.3 | `pinia` 3 + `@pinia/nuxt` 0.11.2 (last release for Nuxt 3) |
| vue-router | listed in `package.json` (v5) | not listed; Nuxt 3 ships vue-router 4 |
| TypeScript | 6.x | 5.9 |

## Install and run locally (port 3000)

Start the backend first (`../nest`, port 3001).

```powershell
cd nuxt3
npm install
copy .env.example .env     # NUXT_PUBLIC_API_BASE=http://localhost:3001
npm run dev                # development mode, http://localhost:3000
```

Build and run the production version:

```powershell
npm run build
$env:PORT='3000'; node .output/server/index.mjs
```

Type check: `npm run typecheck`.

Sign in with `johndoe` / `susiairtest`, or press **Fill in demo account** on the Sign In page.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Backend address |

## Folder layout

```
nuxt3/
├─ app.vue              loads GET /health, then the layout and page; error screen if the API is down
├─ assets/styles/       design tokens and base styles
├─ components/          UI components
├─ composables/         one composable per API endpoint, plus useApi and useToday
├─ layouts/             default (with bottom navigation), bare (Sign In)
├─ middleware/          auth.global.ts redirects to /login without a token
├─ pages/               login, index (Home), schedule/, logbook, more
├─ plugins/api.ts       shared $fetch client: base URL, Bearer token, 401 → Sign In
├─ public/assets/       Susi Air logo
├─ stores/              Pinia: app (today from /health), auth (token)
├─ types/api.ts         API response types
└─ utils/               API error messages, calendar request params, readable text colour
```

## Behaviour difference from `nuxt/`

Opening **More** after **Home** calls `GET /pilot/me` again in this version. In the Nuxt 4 version the profile already loaded on Home is reused. The page shows the same data either way.
