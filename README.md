# Vaneco Prospector

AI-powered B2B prospect scoring tool. Define your ICP, drop in company names, get scored intelligence briefs.

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open http://localhost:3000

## Deploy to Netlify

### Option A — Netlify CLI (fastest)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --build --prod
```

When prompted, it will ask you to add environment variables. Add:
- `ANTHROPIC_API_KEY` → your key from console.anthropic.com

### Option B — Connect via GitHub

1. Push this folder to a GitHub repo
2. Go to app.netlify.com → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variable: `ANTHROPIC_API_KEY`
6. Deploy

## Adding your API key on Netlify

Site settings → Environment variables → Add variable:
- Key: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...`

Then trigger a redeploy.

## Customizing the tool

- **Prompt logic** → `app/api/score/route.js` — edit `buildPrompt()` to change what the AI scores
- **Scoring model** → same file, change `model: 'claude-sonnet-4-20250514'`
- **UI styles** → `app/globals.css`
- **UI components** → `app/page.js`

## Monetization / auth (future)

When ready to charge for access, add:
- **Auth**: [Clerk](https://clerk.com) — 10 min setup with Next.js
- **Payments**: [Stripe](https://stripe.com)
- **Rate limiting**: [Upstash Redis](https://upstash.com)
- **Save results**: [Supabase](https://supabase.com)
