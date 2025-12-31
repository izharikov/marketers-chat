// import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
// import { openai } from '@ai-sdk/openai';
// import {
//     assetTools, componentsTools,
//     contentTools, environmentTools, pagesTools,
//     personalizationTools, sitesTools, jobTools
// } from '@/lib/agents/tools';
// import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';

// import { createMCPClient, auth, OAuthClientProvider } from "@ai-sdk/mcp";

// const authProvider: OAuthClientProvider = {
//     redirectUrl: "http://localhost:3000/callback",
//     clientMetadata: {
//         client_name: "My App",
//         redirect_uris: ["http://localhost:3000/callback"],
//         grant_types: ["authorization_code", "refresh_token"],
//     },
//     // Token and credential storage methods
//     tokens: async () => { /* ... */ },
//     saveTokens: async (tokens) => { /* ... */ },
//     // ... remaining OAuthClientProvider configuration
// };

// await auth(authProvider, { serverUrl: new URL("https://edge-platform.sitecorecloud.io/mcp/marketer-mcp-prod") });

// const client = await createMCPClient({
//     transport: { type: "http", url: "https://edge-platform.sitecorecloud.io/mcp/marketer-mcp-prod", authProvider },
// });

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//     const {
//         messages,
//         model,
//     }: {
//         messages: UIMessage[];
//         model: string;
//     } = await req.json();

//     const url = new URL(req.url);
//     const contextId = url.searchParams.get("contextid")!;
//     const accessToken = req.headers.get("authorization")?.split(" ")[1];

//     const xmcClient = await experimental_createXMCClient({
//         getAccessToken: async () => {
//             return accessToken!;
//         },
//     });

//     const result = streamText({
//         model: openai(model),
//         messages: await convertToModelMessages(messages),
//         system:
//             'You are SitecoreAI assistnant: use available tools.',
//         tools: {
//             ...assetTools(xmcClient, contextId),
//             ...componentsTools(xmcClient, contextId),
//             ...contentTools(xmcClient, contextId),
//             ...environmentTools(xmcClient, contextId),
//             ...pagesTools(xmcClient, contextId),
//             ...personalizationTools(xmcClient, contextId),
//             ...sitesTools(xmcClient, contextId),
//             ...jobTools(xmcClient, contextId),

//         }
//     });
//     // send sources and reasoning back to the client
//     return result.toUIMessageStreamResponse({
//         sendSources: true,
//         sendReasoning: true,
//     });
// }