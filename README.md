# Marketers Chat

This project is a **Sitecore Marketplace Extension** demo built with [Next.js](https://nextjs.org). It demonstrates how to build an application involves authentication and interaction with Sitecore XM Cloud (XMC).

## Features

- **Marketplace SDK Integration**: Utilizes `@sitecore-marketplace-sdk/client` for seamless integration with the Sitecore Cloud Marketplace.
- **Authentication**: Includes examples of both Built-in and Custom Authentication using **Auth0**.
- **Sitecore XM Cloud (XMC)**: Demonstrates patterns for interacting with Sitecore APIs.
- **Secure Development**: Pre-configured for local HTTPS development, a requirement for Sitecore Cloud extensions.

## Prerequisites

- **Node.js** (v20+ recommended)
- **Sitecore Cloud Organization**: Access to a Sitecore Cloud organization to deploy and test the extension.
- **SSL Certificates**: Valid certificates for `myapp.local` are required for local development.

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. HTTPS Configuration

This project is configured to run with HTTPS locally. This is strictly required for embedding the application within the Sitecore Cloud Marketplace interface.

Ensure you have the following certificate files in the `./certificates` directory:
- `myapp.local.pem`
- `myapp.local-key.pem`

### 3. Run Development Server

To start the development server with the necessary HTTPS configurations:

```bash
npm run dev
```

The application will be accessible at:
`https://myapp.local:3000`

> **Note**: The `dev` script in `package.json` is configured to use Next.js experimental HTTPS support:
> `next dev --experimental-https --experimental-https-key ./certificates/myapp.local-key.pem --experimental-https-cert ./certificates/myapp.local.pem`

## Project Structure

- **`app/`**: Next.js App Router structure.
    - `page.tsx`: Main entry point with examples.
    - `layout.tsx`: Root layout including `MarketplaceProvider` and `AuthProvider`.
- **`components/`**:
    - `examples/`: detailed examples of Auth and Data Fetching.
    - `providers/`: Context providers for the Marketplace SDK and Auth0.
- **`next.config.ts`**: Configures **Content Security Policy (CSP)** headers (`frame-ancestors`) to allow the app to be iframe-embedded within `sitecorecloud.io` domains.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sitecore Developer Portal](https://developers.sitecore.com/)
