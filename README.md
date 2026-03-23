<p align="center">
  <img src="public/logo.svg" width="80" height="80" alt="Marketers Chat logo" />
</p>

<h1 align="center">Marketers Chat</h1>

A **Sitecore Marketplace Extension** built with [Next.js](https://nextjs.org) that provides an AI-powered chat interface for content marketers to manage Sitecore XM Cloud resources through natural language.

## Features

- **AI Chat Interface**: Conversational UI for managing Sitecore content, pages, assets, and personalization.
- **Multi-Model Support**: Works with OpenAI, Anthropic, and Vercel AI models via gateway.
- **Tool Execution**: Client-side and server-side AI tool execution with optional approval workflows.
- **Web Search**: Integrated web search via Exa / Perplexity.
- **Marketplace SDK Integration**: Uses `@sitecore-marketplace-sdk/client` for seamless Sitecore Cloud Marketplace integration.
- **Authentication**: Auth0-based authentication with Sitecore organization/tenant context.
- **Secure Development**: Pre-configured for local HTTPS, required for Sitecore Cloud extensions.

## Prerequisites

- **Node.js** (v20+ recommended)
- **pnpm** for package management
- **Sitecore Cloud Organization**: Access to a Sitecore Cloud organization to deploy and test the extension.
- **SSL Certificates**: Valid certificates for `marketers-chat.local` for local development.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. HTTPS Configuration

This project is configured to run with HTTPS locally. This is strictly required for embedding the application within the Sitecore Cloud Marketplace interface.

Ensure you have the following certificate files in the `./certificates` directory:
- `marketers-chat.local.pem`
- `marketers-chat.local-key.pem`

### 3. Run Development Server

```bash
pnpm dev
```

The application will be accessible at:
`https://marketers-chat.local:3000`

> **Note**: The `dev` script uses Next.js experimental HTTPS support:
> `next dev --experimental-https --experimental-https-key ./certificates/marketers-chat.local-key.pem --experimental-https-cert ./certificates/marketers-chat.local.pem`

## Project Structure

- **`app/`**: Next.js App Router structure.
    - `page.tsx`: Main AI chat interface.
    - `layout.tsx`: Root layout with `MarketplaceProvider`, `AuthProvider`, and `AppSettingsProvider`.
    - `api/editors-agent/`: AI agent endpoint with streaming and tool loop.
- **`components/`**:
    - `ai-elements/`: Chat UI components (messages, tools, reasoning, code blocks, etc.).
    - `custom/`: Application-specific components (ai-chat, api-key-modal).
    - `providers/`: Context providers for Marketplace SDK, Auth0, and app settings.
    - `ui/`: Shared UI components.
- **`lib/`**:
    - `ai/`: Model registry and helpers.
    - `tools/`: Tool definitions and capability system.
    - `sitecore/`: Sitecore utilities and API key storage.
- **`next.config.ts`**: Configures **Content Security Policy (CSP)** headers (`frame-ancestors`) to allow the app to be iframe-embedded within `sitecorecloud.io` domains.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sitecore Developer Portal](https://developers.sitecore.com/)
