import z from 'zod';
import {
  ArticleSchema,
  BreadcrumbListSchema,
  CourseSchema,
  EventSchema,
  FAQPageSchema,
  JobPostingSchema,
  LocalBusinessSchema,
  NULL,
  OrganizationSchema,
  ProductSchema,
  RecipeSchema,
  ReviewSchema,
  VideoObjectSchema,
  WebsiteSchema,
} from './schema-definitions';

const Probability = z
  .int32()
  .describe('Probability percent of @type suits page (0-100%)')
  .min(0)
  .max(100)
  .meta({ id: 'probability' });

function schemaItem(schema: z.ZodObject, id: string) {
  return z.object({
    type: z.literal(id),
    probability: Probability,
    probabilityExplanation: z
      .string()
      .describe(
        `Short but detailed explanation of probability percent of '${id}' schema suits page (1-2 sentences)`
      ),
    item: z
      .union([NULL, schema])
      .describe(
        `Set null if probability is low, populate with '${id}' schema if probability is high`
      )
      .meta({ id }),
  });
}

export const schema = z.object({
  article: schemaItem(ArticleSchema, 'article').describe(
    'An article, such as a news article, blog post, or scholarly paper'
  ),
  faqPage: schemaItem(FAQPageSchema, 'faqPage').describe(
    'A page containing a list of frequently asked questions and their answers'
  ),
  event: schemaItem(EventSchema, 'event').describe(
    'An event happening at a certain time and location, such as a concert, lecture, or festival'
  ),
  product: schemaItem(ProductSchema, 'product').describe(
    'Any offered product or service, including physical items, digital products, courses, etc.'
  ),
  localBusiness: schemaItem(LocalBusinessSchema, 'localBusiness').describe(
    'A physical business or branch of an organization, such as a restaurant, store, or medical practice'
  ),
  recipe: schemaItem(RecipeSchema, 'recipe').describe(
    'A recipe, such as a cooking recipe or baking recipe'
  ),
  videoObject: schemaItem(VideoObjectSchema, 'videoObject').describe(
    'A video object, such as a YouTube video or Vimeo video'
  ),
  review: schemaItem(ReviewSchema, 'review').describe(
    'A review of an item, such as a product, business, or creative work'
  ),
  course: schemaItem(CourseSchema, 'course').describe(
    'An educational course, including online courses, college courses, or training programs'
  ),
  jobPosting: schemaItem(JobPostingSchema, 'jobPosting').describe(
    'A job posting or listing for employment opportunities'
  ),
  website: schemaItem(WebsiteSchema, 'website').describe(
    'A website, representing the entire site rather than a single page'
  ),
  organization: schemaItem(OrganizationSchema, 'organization').describe(
    'An organization such as a company, nonprofit, government, school, or other group'
  ),
  breadcrumbList: schemaItem(BreadcrumbListSchema, 'breadcrumbList').describe(
    "A breadcrumb navigation trail showing the page's position in the site hierarchy"
  ),
});

export type PageStructuredData = z.infer<typeof schema>;

export const pageStructuredDataSchema = (isHome: boolean) => {
  if (isHome) {
    return schema.omit('breadcrumbList');
  }
  return schema.omit({
    website: true,
    organization: true,
  });
};
