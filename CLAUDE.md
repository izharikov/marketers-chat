# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Dev server (HTTPS on https://marketers-chat.local:3000)
pnpm build          # Production build (Turbopack)
pnpm lint           # ESLint
```

## Architecture

Sitecore Marketplace Extension — an AI chat interface for managing Sitecore XM Cloud content. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.

### Provider Hierarchy (app/layout.tsx)

Three nested providers wrap the entire app:

1. **MarketplaceProvider** — initializes `ClientSDK` from `@sitecore-marketplace-sdk/client`, provides Sitecore org/tenant context
2. **AuthProvider** — Auth0 wrapper that injects Sitecore `organizationId` and `marketplaceAppTenantId`
3. **AppSettingsProvider** — manages API keys (vercel, openai, anthropic, google, exa) stored in Sitecore via GraphQL, plus local settings (tool approval, execution mode)

### AI Agent Backend (app/api/editors-agent/route.ts)

Streaming endpoint using Vercel AI SDK's `streamText` with a tool loop:
- **Model selection** via `lib/ai/registry.ts` — uses Vercel gateway (`createGateway`) with devtools middleware in dev
- **Tool registration** from `sitecore-ai-sdk-tools` (agent tools, page builder tools) and custom web search
- **Capability-based filtering** — only active tools for selected capabilities are exposed
- **System instructions** — built dynamically per capability from `lib/tools/capabilities.ts`

### Capability System (lib/tools/capabilities.ts)

Five capabilities, each mapping to specific tools and system instructions:
- `page_layout` — get/add/update components and datasources
- `assets` — search, upload, update media
- `personalization` — create versions, manage conditions
- `sites` — list sites and pages
- `websearch` — Perplexity (backend) or Exa (frontend)

Tools are split into `clientOnlyTools` (require browser page context) and `serverOnlyTools` (web search).

### Dual Tool Execution

The chat supports two execution modes (`sitecoreToolsExecution` setting):
- **Frontend**: tools run in browser via `executeAgentTool()`/`executePageBuilderTool()` from sitecore-ai-sdk-tools, auto-executed on `tool-calls` finish reason
- **Backend**: tools run on server with Auth0 token + contextId, supports approval workflow when `needsApproval=true`

### Main Chat Flow (app/page.tsx → components/custom/ai-chat.tsx)

`page.tsx` sets up `useChat()` with `DefaultChatTransport` pointing to `/api/editors-agent`. Headers carry API keys and optional Auth0 token. Request body includes model, capabilities, contextId, and approval settings.

`ai-chat.tsx` renders the chat UI with model selector, capability toggles, message stream, tool invocation panels, approval dialogs, and revert buttons for job-based Sitecore operations.

### Sitecore Storage (lib/sitecore/storage/api-key-storage.ts)

API keys are stored in Sitecore content tree via GraphQL mutations. Uses a `PathCreationMutex` to prevent race conditions during concurrent path segment creation.

### HTTPS Requirement

The app must run under HTTPS to be embedded in Sitecore Cloud iframes. Certificates live in `./certificates/` and are generated with `mkcert` for `marketers-chat.local`.

## Code Style

- ESLint with Next.js core web vitals + TypeScript rules
- Import ordering enforced: builtin → external → internal → relative
- Relative imports going up (`../../*`) are banned — use `@/` path alias
- Prettier: single quotes, trailing commas (es5), semicolons, JSX single quotes
- Package manager: **pnpm** (never npm/npx)
