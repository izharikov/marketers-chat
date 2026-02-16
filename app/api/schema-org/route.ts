import { convertToModelMessages, jsonSchema, JSONSchema7, Output, streamText } from "ai";
import z from "zod/v4";
import { retrieveModel } from "@/lib/ai/registry";
import { pageStructuredDataSchema } from "@/lib/api/schema-org";

export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        site,
        currentPage,
        layout,
        language,
    } = await req.json();
    const apiKey = req.headers.get("x-vercel-api-key");
    if (!apiKey) {
        return Response.json(
            { error: "API key is required" },
            { status: 401 }
        );
    }
    const { model, providerOptions } = retrieveModel('openai/gpt-5-nano', apiKey);
    const originalSchema = pageStructuredDataSchema(currentPage.isHome);
    const schema = jsonSchema(z.toJSONSchema(originalSchema, {
        reused: 'ref'
    }) as JSONSchema7);

    const result = streamText({
        model,
        system: `You are an expert in structured data and schema markup for SitecoreAI website.
Your goal is to EXTRACT schema.org markup from available site content, page content and layout.

When implementing schema, understand:
- Page Type - What kind of page? What's the primary content? What rich results are possible?
- Goals - Which rich results are you targeting? What's the business value?

## IMPORTANT
- Be strict and don't generate schema if PAGE CONTENT (fields + layout) doesn't suit to @type (e.g. DON'T generate schema for @type=Article if page is not article)
- Use current page route information for breadcrumbList is applies

## Sitecore Date Format
yyyyMMddTHHmmssZ, example: 20250513T151718Z
`,
        output: Output.object({
            schema,
        }),
        messages: await convertToModelMessages([
            {
                role: 'user',
                parts: [
                    {
                        type: 'text',
                        text: `
## Page language and langauge for output: ${language}

## Site information
- name: ${site.name}
- host: ${site.host}

## Current page item fields
- route: ${currentPage.route} (this page is ${currentPage.isHome ? 'home' : 'not home'} page)
- template name: ${currentPage.templateName}
- fields:
${Object.entries(currentPage.fields).map(([key, field]) => `  - ${key}: ${(field as any)?.value}`).join('\n')}
- created: ${currentPage.created}
- updated: ${currentPage.updated}

## Page Layout (components and datasources)
${JSON.stringify(layout)}
`,
                    }
                ]
            }
        ]),
        providerOptions,
        abortSignal: req.signal,
    });
    return result.toUIMessageStreamResponse();
}