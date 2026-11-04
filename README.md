# Susi Air Pilot App

A mobile web app for Susi Air pilots: view the schedule, log flight hours, and track how close they are to their duty limits.

| Part | Folder | Technology | Local port |
| --- | --- | --- | --- |
| Backend (REST API) | [`nest/`](nest) | NestJS 12, TypeScript, JWT | 3001 |
| Frontend | [`nuxt/`](nuxt) | Nuxt 3 (3.21), Vue 3 (Composition API, `<script setup>`), Pinia, SCSS, TypeScript | 3000 |

Screens: Sign In, Home (Hours to Limit and My Documents), Schedule, Logbook, and More. All data comes from the API; the frontend keeps no mock data. The data comes from three JSON files that the backend loads into memory at startup, with no database.

---

## URLs

| Name | URL |
| --- | --- |
| GitHub Repository | https://github.com/AsyrafbilalFBJ/pilotapp |
| UI URL | https://pilotapp-zeta.vercel.app |
| API URL | https://pilotapp-production-f916.up.railway.app |
| API Documentation | https://pilotapp-production-f916.up.railway.app/docs |

---

## 1. Install and run locally

**Prerequisites:** Node.js 22 or newer, and npm. Run the backend and the frontend in two separate terminals, and start with the backend.

### Backend (`nest/`, runs on port 3001)

```powershell
cd nest
npm ci
copy .env.example .env
```

Open `nest/.env` and set `JWT_SECRET` to a random string of at least 16 characters. The server refuses to start if the value is empty or too short. One way to generate it:

```powershell
node -p "require('node:crypto').randomBytes(32).toString('hex')"
```

Run:

```powershell
npm run start:dev          # development mode
```

Build and run the production version:

```powershell
npm run build
npm run start:prod
```

Check: `http://localhost:3001/health`, and the API documentation (Swagger) at `http://localhost:3001/docs`.

Other commands: `npm test` (unit tests), `npm run test:e2e` (e2e tests), `npm run lint`.

### Frontend (`nuxt/`, runs on port 3000)

```powershell
cd nuxt
npm ci
copy .env.example .env     # NUXT_PUBLIC_API_BASE=http://localhost:3001
npm run dev                # development mode
```

Build and run the production version:

```powershell
npm run build
$env:PORT='3000'; node .output/server/index.mjs
```

Open `http://localhost:3000` and sign in with:

- **Username:** `johndoe`
- **Password:** `susiairtest`

Or press **Fill in demo account** on the Sign In page to fill both fields.

If the backend is not running, the frontend shows a "Can't reach the Pilot App service" screen with a Try again button.

---

## 2. Environment variables

### Backend (`nest/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | API port |
| `APP_TODAY` | `2026-05-15` | The date treated as "today" (`YYYY-MM-DD`). The system clock is never used |
| `DATASOURCE_DIR` | `src/datasource` | Folder with the three JSON files, relative to the folder the app is started from |
| `JWT_SECRET` | **required** | JWT signing key, at least 16 characters |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime: seconds (`3600`) or a duration (`15m`, `12h`, `1d`) |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed browser origin(s), comma-separated |
| `SWAGGER_ENABLED` | `true` | Set to `false` to turn off `/docs` |

An invalid value (an invalid date, a port out of range, a secret that is too short) makes the server stop at startup with a clear message.

### Frontend (`nuxt/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Backend address |

---

## 3. Main choices and the reasoning behind them

This table covers the decisions made together, the decisions made alone, how point 4 of the brief ("Things to Handle") is handled, and additions beyond the brief.

| Decision | Reason |
| --- | --- |
| **"Today" comes from the `APP_TODAY` env variable** | The brief forbids `new Date()`. One source for all logic makes the result the same on every review. The `today` fields inside the JSON files are ignored because their values differ, so there are not two versions of the date |
| **Duty type codes follow the JSON** (`DTY, RLV, SCK, TRD, TRX, ADM, FER, MED, REC, ULV`) | The brief writes `DUTY, RL, TR, TX, UL`, which differs from the JSON data. The JSON data is the real source, and the legend is rendered from the API with nothing hardcoded |
| **The schedule `status` field is still used (schedule styling)** | Completed days (status 2) are filled with `base_color`, and upcoming days (status 1) only get an outline. This is separate from the ✓ or remaining-duties indicator |
| **The document badge is computed by the backend from `thresholds`** | The brief asks for the badge state to come from the API. `daysRemaining = expiryDate − today`: `<= 0` is expired, `1..30` is soon, otherwise safe |
| **Avatar from `ui-avatars.com` using the pilot's name** | The JSON has no avatar. The backend builds the URL with the name encoded |
| **Auth uses a real JWT, with the secret in env** | More realistic than a random token. The guard checks the signature and expiry, and only `/auth/login` and `/health` are public. Credentials are compared in constant time |
| **Two separate projects, `nest` and `nuxt`** | Each has its own `package.json` and `.env`, so they can be built and run separately |
| **Chart.js (`vue-chartjs`)** | The annotation plugin draws the chart visualisation, so it did not have to be built by hand, which would take time |
| **`nest/` folder structure** | Keeps the endpoint requirements clearly separate from the infrastructure |
| **Card status: safe < 70%, warning 70–<90%, danger ≥ 90% or over the limit** | Classifies the status of the Hours to Limit cards on the Home page |
| **`isFuture`, `isPartialWindow`, and `windowDays` are still sent** | The frontend can draw the planned part with a dashed line without computing anything itself |
| **Logbook page** with a date range from user input, days with 0 hours still shown, and future days (> today) labelled "Planned" | The `/flight-hours` endpoint is used on the Logbook page. The Planned label matches the chart |
| **More page** with a profile card and a Logout button | A simple account page. The profile card uses the same `/pilot/me` as Home, and the page holds the Logout function |
| **Logout happens only in the frontend** | A JWT is stateless. The token is removed in the browser and stays valid on the server until it expires, a limitation recorded in section 4 |
| **The frontend only renders; display fields come from the backend** (`monthLabel`, `leadingBlankDays`, `days`, `formattedDate`, `formattedExpiryDate`) | The frontend does not compute the number of days, the first weekday of a month, or date formats. It only computes request parameters (previous/next month, the initial Logbook range). `year` and `month` stay required |
| **"Today" in the frontend is read from `GET /health` when the app opens** | Checks that the API is up before any other page loads, and keeps the today value in the frontend state |
| **All API calls live in composables, one per endpoint** | Pages only call a function. The profile is shared by Home and More under one cache key, so later development can simply call the fetch function |
| **Calendar: smaller font on narrow screens** | The calendar overlapped on screens narrower than 390px. After shrinking the font, the cell sizes were measured at 320–480px and nothing overlaps any more |
| **Future dates still get a value** | Flight hours after today in the data are treated as planned hours, so the future rolling sum is a projection assuming the pilot flies as planned (marked `isFuture`, drawn dashed). Dates after the end of the data (31 May 2026) count as 0. If future dates counted as 0, the 1w view would never show a value above the red line |
| **A value above the red line must not break the layout** | The value is sent as is with `isExceeded: true`. The Y axis uses `yAxisMax` from the API (45 for a limit of 40), the point is red, and the tooltip says "Above limit". A card over its limit automatically gets the danger status. The highest value, 44.7, still fits inside the chart |
| **The rolling sum is computed entirely in the backend** | The frontend only renders the values from the API |
| **The calendar week starts on Monday** | Common for operational schedules, and easy to change |
| **Frontend is an SPA (`ssr: false`), token in a session cookie** | Every screen needs a sign-in and the token lives in the browser. The cookie keeps the pilot signed in after a reload, and a 401 response clears the token and sends the pilot to Sign In |
| **The `/flight-hours` range is limited to 731 days** | Stops a single request from asking for unbounded data |
| **Backend additions beyond the brief** | `GET /health`, Swagger at `/docs`, env validation at boot, a uniform error shape (`{ statusCode, message, error, timestamp, path }`), 50 unit tests and 33 e2e tests |
| **Frontend additions beyond the brief** | A demo account card with a fill-in button and a show/hide password toggle on Sign In, a startup error screen when the API is down, the Schedule month kept in the URL (`?year&month`) so the back button from the detail page stays on the same month, a `/schedule/<date>` placeholder page, an extended legend, a Try again button in each section, and accessibility attributes |

---

## 4. What I would change with more time

**Security and auth**
- Short-lived tokens plus a refresh token, with token revocation on the server at logout. Today logout only removes the token in the browser.
- Keep the token in an `httpOnly` cookie through the Nuxt server layer, because the cookie can currently be read by JavaScript.
- Accounts from real storage with hashed passwords, instead of a single hardcoded account. Plus login attempt limits and security headers.

**Quality and testing**
- **The frontend has no automated tests yet.** All that exists is manual checking with headless Chrome. This is the first priority: Vitest for composables and components, and Playwright for the flow login → Home → Schedule → Logbook → logout.
- Complete the unit tests so that every function is checked against what it is expected to do.

**Backend**
- A real database in place of the in-memory JSON, with explicit time zone handling.
- Compute the rolling sum with a cumulative sum (prefix sum) so each point is O(1). Today each point sums the whole window, which is still fine for this data.

**Features and UI**
- A real day detail page in Schedule (list of flights).
- Dark mode, multiple languages (date labels are currently always English), and offline support through a PWA.
- A confirmation before logout.

---

## 5. API endpoint list

Local base URL: `http://localhost:3001`. Interactive documentation (Swagger) is at `/docs`, and the OpenAPI specification in JSON is at `/docs-json`. Both are available while env `SWAGGER_ENABLED=true`.

| Method | Path | Access | Parameters | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Body: `username`, `password` (required) | `{ token }`. **400** if a field is missing or an extra field is sent, **401** "Invalid username or password" if the credentials are wrong |
| `GET` | `/health` | Public | - | `{ status: "ok", today }`. The frontend calls it at startup to read "today" and check the API is up |
| `GET` | `/pilot/me` | Token | - | `{ name, totalFlightHours, avatarUrl }` |
| `GET` | `/flight-hours` | Token | Query: `from`, `to` (required, `YYYY-MM-DD`). `from` must not be after `to`, at most 731 days | `{ from, to, today, days[], totalHours }`. One entry per day (`date`, `formattedDate`, `hours`, `isFuture`); a day with no data is 0. **400** if a parameter is invalid |
| `GET` | `/flight-hours/summary` | Token | Query: `range` = `1w`, `1m`, `3m`, `6m`, or `1y` (optional, default `1w`) | `{ today, selectedRange, cards[4], chart }`. The rolling sum is computed on the server. **400** if `range` is unknown |
| `GET` | `/documents` | Token | - | `{ today, warningDays, documents[] }`. Each document: `id`, `label`, `expiryDate`, `formattedExpiryDate`, `daysRemaining`, `status` (`safe`, `soon`, `expired`) |
| `GET` | `/schedules` | Token | Query: `year` (4 digits) and `month` (1–12, `5` or `05`), both required | `{ year, month, monthLabel, today, leadingBlankDays, days[], schedules[], legend[] }`. A month with no data returns every date with `schedule: null`. **400** if a parameter is invalid |

**Error shape** (the same for every endpoint):

```json
{ "statusCode": 400, "message": ["from must be a valid date in YYYY-MM-DD format"], "error": "Bad Request", "timestamp": "2026-05-15T08:00:00.000Z", "path": "/flight-hours" }
```

`message` is a string, or a list of strings for validation errors.

---

## 6. UI page list

When the app opens, the frontend calls `GET /health` first. A user who is not signed in (has no token) is redirected to `/login`, and a user who is already signed in and opens `/login` is redirected to `/`.

| Route | Page | Login | API data | Page content |
| --- | --- | --- | --- | --- |
| `/login` | **Sign In** | No | `POST /auth/login` | Username and password form with a show/hide password toggle. Wrong credentials show the message "Invalid username or password". Below the Sign in button, a **Demo account** card shows the username and password, and its **Fill in demo account** button fills both fields (the pilot still presses Sign in) |
| `/` | **Home** | Yes | `/pilot/me`, `/flight-hours/summary`, `/documents` | Header (greeting, name, total flight hours, avatar). **Hours to limit**: 4 limit cards and a rolling sum chart with a `1w`, `1m`, `3m`, `6m`, `1y` toggle (default `1w`), a red limit line, and a dashed planned section. **My Documents**: a list of documents with a Safe, Expiring Soon, or Expired badge |
| `/schedule` | **Schedule** | Yes | `/schedules` | Monthly calendar with previous and next month buttons (each change calls the API). Days are coloured by the duty's `base_color`, with a ✓ when every duty is logged or the number of remaining duties otherwise, a ring on today, and a legend below. The month is kept in the URL (`?year=2026&month=6`) |
| `/schedule/<YYYY-MM-DD>` | **Day detail** (placeholder) | Yes | - | The text "Detail page coming soon" and a button back to the previous month. Opened by tapping a date in the calendar |
| `/logbook` | **Logbook** | Yes | `/flight-hours` | Date range picker (default: the 1st of this month up to today), total flight hours, and the hours per day including 0-hour days. Days after today carry a **Planned** label. An invalid range shows the message from the API |
| `/more` | **More** | Yes | `/pilot/me` | Profile card (avatar, name, total flight hours) and a **Log out** button that removes the token and returns to Sign In |

**Screen outside the routes:** if `GET /health` fails when the app opens, a "Can't reach the Pilot App service" screen appears with a Try again button, and no other page is shown.
