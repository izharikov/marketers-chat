import { devToolsMiddleware } from "@ai-sdk/devtools";
import { convertToModelMessages, gateway, jsonSchema, JSONSchema7, Output, streamText, wrapLanguageModel } from "ai";
import z from "zod/v4";
import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { ArticleSchema, ProductSchema, LocalBusinessSchema, BreadcrumbListSchema, PersonSchema, RecipeSchema, VideoObjectSchema, ReviewSchema, CourseSchema, JobPostingSchema } from "./schema-definitions";

export const maxDuration = 30;


export async function POST(req: Request) {
    const { messages } = await req.json();
    const model = process.env.NODE_ENV === 'development' ? wrapLanguageModel({
        model: gateway('openai/gpt-5-nano'),
        middleware: [devToolsMiddleware()],
    }) : 'openai/gpt-5-nano';

    const zodSchema = z.object({
        items: z.array(z.union([
            ArticleSchema,
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
        system: `Generate schema.org JSON-LD for the following page content:

        Page url: https://website.com/ai/ai-test
        Title: AI test

        `,
        output: Output.object({
            schema,
        }),
        messages: await convertToModelMessages(messages),
        providerOptions: {
            openai: {
                reasoningEffort: 'minimal',
                strictJsonSchema: true,
            } satisfies OpenAIResponsesProviderOptions
        }
    });
    return result.toUIMessageStreamResponse();
}