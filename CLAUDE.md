Sitecore Marketplace Extension — AI chat for SitecoreAI. Next.js 16, React 19, Tailwind CSS 4.

## Naming

- The product name is **SitecoreAI** (one word, no space). Never write "Sitecore AI", "Sitecore XM Cloud", or "XM Cloud".

## Key Concepts

- **Authentication** — Sitecore Marketplace SDK (client-side) or Auth0 (server-side)
- **AI agent** — Vercel AI SDK (`ToolLoopAgent`, `useChat`, streaming). Supports multiple tool groups; Sitecore Agent API tools execute on client or server. Uses skills from `chat-skills/`.
- **Sitecore API access** - Marketplace SDK

## Tech Stack

shadcn, Sitecore Marketplace SDK, Blok, AI Elements

## Code Style

- `@/` path alias required — no `../../` relative imports
- **pnpm** only (never npm/npx)
