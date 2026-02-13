import { convertToModelMessages, jsonSchema, JSONSchema7, Output, streamText, zodSchema } from "ai";
import z from "zod/v4";
import { ArticleSchema, ProductSchema, LocalBusinessSchema, BreadcrumbListSchema, RecipeSchema, VideoObjectSchema, ReviewSchema, CourseSchema, JobPostingSchema, WebsiteSchema, FAQPageSchema, EventSchema } from "./schema-definitions";
import { retrieveModel } from "@/lib/ai/registry";

export const maxDuration = 30;

function schemaItem(schema: z.ZodObject) {
    return z.object({
        probability: z.int32().describe('Probability percent of @type suits page'),
        item: z.union([
            z.literal('Ignore').describe('If low probability'),
            schema,
        ]),
    });
}

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
    const originalSchema = z.object({
        article: schemaItem(ArticleSchema),
        faqPage: schemaItem(FAQPageSchema),
        event: schemaItem(EventSchema),
        product: schemaItem(ProductSchema),
        localBusiness: schemaItem(LocalBusinessSchema),
        recipe: schemaItem(RecipeSchema),
        videoObject: schemaItem(VideoObjectSchema),
        review: schemaItem(ReviewSchema),
        course: schemaItem(CourseSchema),
        jobPosting: schemaItem(JobPostingSchema),
        ...(currentPage.isHome ?
            { website: schemaItem(WebsiteSchema) }
            : { breadcrumbList: schemaItem(BreadcrumbListSchema) }),
    });

    const schema = zodSchema(originalSchema, { useReferences: true });

    const result = streamText({
        model,
        system: `You are an expert in structured data and schema markup for SitecoreAI website.
Your goal is to EXTRACT schema.org markup from available site content, page content and layout.

When implementing schema, understand:
- Page Type - What kind of page? What's the primary content? What rich results are possible?
- Goals - Which rich results are you targeting? What's the business value?

# IMPORTANT
- Be strict and don't generate schema if PAGE CONTENT (fields + layout) doesn't suit to @type (e.g. DON'T generate schema for @type=Article if page is not article)
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

## Site information (use host for url)
${JSON.stringify(site)}

## Current page item fields
${JSON.stringify(currentPage)}

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