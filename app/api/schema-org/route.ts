import { devToolsMiddleware } from "@ai-sdk/devtools";
import { convertToModelMessages, gateway, jsonSchema, JSONSchema7, Output, streamText, wrapLanguageModel } from "ai";
import z from "zod/v4";
import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { ArticleSchema, ProductSchema, LocalBusinessSchema, BreadcrumbListSchema, PersonSchema, RecipeSchema, VideoObjectSchema, ReviewSchema, CourseSchema, JobPostingSchema, WebsiteSchema, FAQPageSchema, EventSchema } from "./schema-definitions";

export const maxDuration = 30;


export async function POST(req: Request) {
    const {
        messages,
        currentFieldValue,
        pageInfo,
        layout,
    } = await req.json();
    const model = process.env.NODE_ENV === 'development' ? wrapLanguageModel({
        model: gateway('openai/gpt-5-nano'),
        middleware: [devToolsMiddleware()],
    }) : 'openai/gpt-5-nano';

    const zodSchema = z.object({
        items: z.array(z.union([
            ArticleSchema,
            WebsiteSchema,
            FAQPageSchema,
            EventSchema,
            ProductSchema,
            LocalBusinessSchema,
            BreadcrumbListSchema,
            PersonSchema,
            RecipeSchema,
            VideoObjectSchema,
            ReviewSchema,
            CourseSchema,
            JobPostingSchema,
        ]))
    });

    const schema = jsonSchema(zodSchema.toJSONSchema() as JSONSchema7);
    const result = streamText({
        model,
        system: `You are an expert in structured data and schema markup. Your goal is to implement schema.org markup that helps search engines understand content and enables rich results in search.

        When implementing schema, understand:
- Page Type - What kind of page? What's the primary content? What rich results are possible?
- Current State - Any existing schema? Errors in implementation? Which rich results already appearing?
- Goals - Which rich results are you targeting? What's the business value?

        Page information: ${JSON.stringify(pageInfo)}
        Layout: ${JSON.stringify(layout)}

        Current value: ${currentFieldValue}
        `,
        output: Output.object({
            schema,
        }),
        messages: await convertToModelMessages(messages),
        providerOptions: {
            openai: {
                reasoningEffort: 'minimal',
                strictJsonSchema: true,
                include: ['reasoning.encrypted_content'],
            } satisfies OpenAIResponsesProviderOptions
        }
    });
    return result.toUIMessageStreamResponse();
}