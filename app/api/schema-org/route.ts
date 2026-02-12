import { convertToModelMessages, jsonSchema, JSONSchema7, Output, streamText } from "ai";
import z from "zod/v4";
import { ArticleSchema, ProductSchema, LocalBusinessSchema, BreadcrumbListSchema, PersonSchema, RecipeSchema, VideoObjectSchema, ReviewSchema, CourseSchema, JobPostingSchema, WebsiteSchema, FAQPageSchema, EventSchema } from "./schema-definitions";
import { retrieveModel } from "@/lib/ai/registry";

export const maxDuration = 30;

function schemaItem<T>(schema: z.ZodType<T>) {
    return z.union([
        z.literal('Ignore').describe('If current page doesn\'t suit to this schema'),
        schema,
    ]);
}

export async function POST(req: Request) {
    const {
        messages,
        site,
        currentPage,
        layout,
    } = await req.json();
    const apiKey = req.headers.get("x-vercel-api-key");
    if (!apiKey) {
        return Response.json(
            { error: "API key is required" },
            { status: 401 }
        );
    }
    const { model, providerOptions } = retrieveModel('openai/gpt-5-nano', apiKey);
    const zodSchema = z.object({
        article: schemaItem(ArticleSchema),
        faqPage: schemaItem(FAQPageSchema),
        event: schemaItem(EventSchema),
        product: schemaItem(ProductSchema),
        localBusiness: schemaItem(LocalBusinessSchema),
        person: schemaItem(PersonSchema),
        recipe: schemaItem(RecipeSchema),
        videoObject: schemaItem(VideoObjectSchema),
        review: schemaItem(ReviewSchema),
        course: schemaItem(CourseSchema),
        jobPosting: schemaItem(JobPostingSchema),
        ...(currentPage.isHome ?
            { website: schemaItem(WebsiteSchema) }
            : { breadcrumbList: schemaItem(BreadcrumbListSchema) }),
    });

    const schema = jsonSchema(zodSchema.toJSONSchema() as JSONSchema7);
    const result = streamText({
        model,
        system: `You are an expert in structured data and schema markup for SitecoreAI website.
Your goal is to implement schema.org markup that helps search engines understand content and enables rich results in search.

When implementing schema, understand:
- Page Type - What kind of page? What's the primary content? What rich results are possible?
- Current State - Any existing schema? Errors in implementation? Which rich results already appearing?
- Goals - Which rich results are you targeting? What's the business value?

# IMPORTANT (!!)
- Be strict and don't generate schema if it doesn't suit to @type (e.g. DON'T generate schema for @type=Article if page is not article)

## Site information (use host for url)
${JSON.stringify(site)}

## Current page content
${JSON.stringify(currentPage)}

## Page Layout (components and datasources)
${JSON.stringify(layout)}
`,
        output: Output.object({
            schema,
        }),
        messages: await convertToModelMessages(messages),
        providerOptions,
        abortSignal: req.signal,
    });
    return result.toUIMessageStreamResponse();
}