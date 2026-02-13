import { convertToModelMessages, jsonSchema, JSONSchema7, Output, streamText, zodSchema } from "ai";
import z from "zod/v4";
import { ArticleSchema, ProductSchema, LocalBusinessSchema, BreadcrumbListSchema, RecipeSchema, VideoObjectSchema, ReviewSchema, CourseSchema, JobPostingSchema, WebsiteSchema, FAQPageSchema, EventSchema, NULL, OrganizationSchema } from "./schema-definitions";
import { retrieveModel } from "@/lib/ai/registry";

export const maxDuration = 30;

const Probability = z.int32()
    .describe('Probability percent of @type suits page')
    .meta({ id: 'probability' });

function schemaItem(schema: z.ZodObject, id: string) {
    return z.object({
        probability: Probability,
        item: z.union([
            NULL,
            schema,
        ]).meta({ id }),
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
        article: schemaItem(ArticleSchema, 'article')
            .describe('An article, such as a news article, blog post, or scholarly paper'),
        faqPage: schemaItem(FAQPageSchema, 'faqPage')
            .describe('A page containing a list of frequently asked questions and their answers'),
        event: schemaItem(EventSchema, 'event')
            .describe('An event happening at a certain time and location, such as a concert, lecture, or festival'),
        product: schemaItem(ProductSchema, 'product')
            .describe('Any offered product or service, including physical items, digital products, courses, etc.'),
        localBusiness: schemaItem(LocalBusinessSchema, 'localBusiness')
            .describe('A physical business or branch of an organization, such as a restaurant, store, or medical practice'),
        recipe: schemaItem(RecipeSchema, 'recipe')
            .describe('A recipe, such as a cooking recipe or baking recipe'),
        videoObject: schemaItem(VideoObjectSchema, 'videoObject')
            .describe('A video object, such as a YouTube video or Vimeo video'),
        review: schemaItem(ReviewSchema, 'review')
            .describe('A review of an item, such as a product, business, or creative work'),
        course: schemaItem(CourseSchema, 'course')
            .describe('An educational course, including online courses, college courses, or training programs'),
        jobPosting: schemaItem(JobPostingSchema, 'jobPosting')
            .describe('A job posting or listing for employment opportunities'),
        ...(currentPage.isHome ?
            {
                website: schemaItem(WebsiteSchema, 'website')
                    .describe('A website, representing the entire site rather than a single page'),
                organization: schemaItem(OrganizationSchema, 'organization')
                    .describe('An organization such as a company, nonprofit, government, school, or other group'),
            }
            : {
                breadcrumbList: schemaItem(BreadcrumbListSchema, 'breadcrumbList')
                    .describe('A breadcrumb navigation trail showing the page\'s position in the site hierarchy')
            }),
    });

    // const schema = zodSchema(originalSchema, { useReferences: true });
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