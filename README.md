# AI Workflow Assistant

Magnon assignment: submit a content request, get an LLM assessment, then a code-based routing decision.

- **Client:** React (port `3000`)
- **Server:** Express + Groq (port `3001`)

Design notes: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [Groq API key](https://console.groq.com/keys)

## 1. Configure the server

```bash
cd server
```

Copy `.env example` to `.env` and fill in:

```
GROQ_API_KEY=your_key_here
PORT=3001
```

`PORT` must be `3001` locally. The UI calls `{API}/api/processWithLLM` (`http://localhost:3001` unless `REACT_APP_API_URL` is set).

Do not commit `.env`.

## 2. Start the API

From `server/`:

```bash
npm install
npm run dev
```

You should see: `Server running on port: 3001`

Leave this terminal open.

## 3. Start the UI

In a **second** terminal:

```bash
cd client
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

## 4. Run a request

The form is prefilled with the assignment sample:

- **Title:** Customer Success Story
- **Description:** Retail customer adopting Adobe Experience Cloud

Click **Submit Request**. The API returns summary, key messaging, recommended format, complexity, and routing decision.

## Layout

```
├── client/                 React UI
├── server/
│   ├── index.js            Express entry
│   ├── routes/             POST /api/processWithLLM
│   ├── services/           Intake → LLM → route
│   ├── workflow/           Prompts, Groq call, routing map
│   └── .env example
└── ARCHITECTURE.md
```

## Deploy on Vercel

This is two apps. Create **two Vercel projects** from the same Git repo (import twice, different Root Directory). The LLM call can take tens of seconds; Hobby allows up to 300s per function, which is enough.

### A. API (`server/`)

1. Push the repo to GitHub.
2. [New project](https://vercel.com/new) → this repo → **Root Directory:** `server`.
3. Framework: Express (or Other). No build command. Output: leave default.
4. Environment variables:
   - `GROQ_API_KEY` — your Groq key
   - `CLIENT_ORIGIN` — the UI URL, e.g. `https://your-app.vercel.app` (set this after the UI is deployed, then redeploy the API)
5. Deploy. Copy the URL, e.g. `https://magnon-api.vercel.app`.

Local `app.listen` is skipped on Vercel (`VERCEL` is set). The Express app is exported instead.

### B. UI (`client/`)

1. New project → same repo → **Root Directory:** `client`.
2. Framework: Create React App. Build: `npm run build`. Output: `build`.
3. Environment variable on this **client** project (not the API project):
   - Key: `REACT_APP_API_URL`
   - Value: the **API** URL, e.g. `https://your-api.vercel.app`  
     No trailing slash. Do **not** use the UI URL.
   - Check **Production** (Development only affects `vercel dev`).
4. **Deployments → ⋯ → Redeploy** and **uncheck** “Use existing Build Cache”. CRA inlines the variable at build time; saving env vars does not change an old bundle.
5. Confirm in DevTools → Network that the POST goes to `https://your-api.vercel.app/api/processWithLLM`, not `localhost`.

### Order

Deploy the API first so you have a URL. Then deploy the UI with `REACT_APP_API_URL`. Then set `CLIENT_ORIGIN` on the API to that UI URL and redeploy the API.

Do not put `GROQ_API_KEY` in the client project.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `GROQ_API_KEY is not set` | Create `server/.env` and restart `npm run dev` |
| UI shows network / request failed | Start the server first; confirm it is on **3001**, or set `REACT_APP_API_URL` for Vercel |
| Vercel UI calls localhost | Set `REACT_APP_API_URL` on the **client** project, tick **Production**, Redeploy **without** build cache. Value must be the API host, not the UI host. |
| Vercel 401/empty from Groq | `GROQ_API_KEY` is on the **server** project, not the client |
| CORS error after deploy | Set `CLIENT_ORIGIN` on the API to the exact UI origin (`https://….vercel.app`) |
| Port 3000 already in use | CRA will offer another port; the API URL is unchanged |
| Empty or 400 response | Title and description are both required |
