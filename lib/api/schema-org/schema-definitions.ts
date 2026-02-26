import { z } from 'zod';

// ============================================
// SHARED/REUSABLE SCHEMAS (Not Exported)
// ============================================

const ImageObjectSchema = z
  .object({
    '@type': z.literal('ImageObject'),
    url: z.string().describe('URL of the image'),
    width: z.number().describe('Width of the image in pixels').nullable(),
    height: z.number().describe('Height of the image in pixels').nullable(),
  })
  .meta({ id: 'ImageObjectSchema' });

const PostalAddressSchema = z
  .object({
    '@type': z.literal('PostalAddress'),
    streetAddress: z.string().nullable(),
    addressLocality: z.string().describe('City or locality').nullable(),
    addressRegion: z.string().describe('State, province, or region').nullable(),
    postalCode: z.string().nullable(),
    addressCountry: z.string().describe('Country name or ISO code').nullable(),
  })
  .meta({ id: 'PostalAddressSchema' });

const GeoCoordinatesSchema = z
  .object({
    '@type': z.literal('GeoCoordinates'),
    latitude: z.number().describe('Latitude in decimal degrees'),
    longitude: z.number().describe('Longitude in decimal degrees'),
  })
  .meta({ id: 'GeoCoordinatesSchema' });

const PersonSchema = z
  .object({
    '@type': z.literal('Person'),
    name: z.string(),
    url: z.string().nullable(),
  })
  .meta({ id: 'PersonSchema' });

const OrganizationBaseSchema = z
  .object({
    '@type': z.literal('Organization'),
    name: z.string(),
    url: z.string().nullable(),
    logo: z.union([z.string(), ImageObjectSchema]).nullable(),
  })
  .meta({ id: 'OrganizationBaseSchema' });

const OfferSchema = z
  .object({
    '@type': z.literal('Offer'),
    url: z.string().describe('URL where the offer can be purchased').nullable(),
    price: z.union([z.string(), z.number()]).nullable(),
    priceCurrency: z
      .string()
      .describe('ISO 4217 currency code (e.g., USD, EUR)')
      .nullable(),
    availability: z
      .string()
      .describe(
        'Availability status URL from schema.org vocabulary (e.g., https://schema.org/InStock)'
      )
      .nullable(),
    validFrom: z
      .string()
      .describe('ISO 8601 date when the offer becomes valid')
      .nullable(),
    priceValidUntil: z
      .string()
      .describe('ISO 8601 date when the price expires')
      .nullable(),
    itemCondition: z
      .string()
      .describe(
        'Condition URL from schema.org vocabulary (e.g., https://schema.org/NewCondition)'
      )
      .nullable(),
  })
  .meta({ id: 'OfferSchema' });

const RatingSchema = z
  .object({
    '@type': z.literal('Rating'),
    ratingValue: z.union([z.string(), z.number()]),
    bestRating: z
      .union([z.string(), z.number()])
      .describe('Best possible rating (default is 5)')
      .nullable(),
    worstRating: z
      .union([z.string(), z.number()])
      .describe('Worst possible rating (default is 1)')
      .nullable(),
  })
  .meta({ id: 'RatingSchema' });

const AggregateRatingSchema = z
  .object({
    '@type': z.literal('AggregateRating'),
    ratingValue: z
      .union([z.string(), z.number()])
      .describe('Average numeric rating'),
    reviewCount: z.union([z.string(), z.number()]).nullable(),
    ratingCount: z.union([z.string(), z.number()]).nullable(),
    bestRating: z
      .union([z.string(), z.number()])
      .describe('Best possible rating (default is 5)')
      .nullable(),
    worstRating: z
      .union([z.string(), z.number()])
      .describe('Worst possible rating (default is 1)')
      .nullable(),
  })
  .meta({ id: 'AggregateRatingSchema' });

const PlaceSchema = z
  .object({
    '@type': z.literal('Place'),
    name: z.string().nullable(),
    address: z.union([z.string(), PostalAddressSchema]).nullable(),
    geo: GeoCoordinatesSchema.nullable(),
  })
  .meta({ id: 'PlaceSchema' });

const VirtualLocationSchema = z
  .object({
    '@type': z.literal('VirtualLocation'),
    url: z.string().describe('URL where the event can be attended virtually'),
  })
  .meta({ id: 'VirtualLocationSchema' });

const BrandSchema = z
  .object({
    '@type': z.literal('Brand'),
    name: z.string(),
  })
  .meta({ id: 'BrandSchema' });

const OpeningHoursSpecificationSchema = z
  .object({
    '@type': z.literal('OpeningHoursSpecification'),
    dayOfWeek: z
      .union([z.string(), z.array(z.string())])
      .describe('Day(s) of the week (e.g., Monday, Tuesday)'),
    opens: z.string().describe('Opening time in HH:MM format (e.g., 09:00)'),
    closes: z.string().describe('Closing time in HH:MM format (e.g., 17:00)'),
  })
  .meta({ id: 'OpeningHoursSpecificationSchema' });

const HowToStepSchema = z
  .object({
    '@type': z.literal('HowToStep'),
    text: z.string(),
    name: z.string().nullable(),
    url: z.string().nullable(),
  })
  .meta({ id: 'HowToStepSchema' });

const NutritionInformationSchema = z
  .object({
    '@type': z.literal('NutritionInformation'),
    calories: z
      .string()
      .describe('Calorie count (e.g., "250 calories")')
      .nullable(),
  })
  .meta({ id: 'NutritionInformationSchema' });

const ContactPointSchema = z
  .object({
    '@type': z.literal('ContactPoint'),
    telephone: z
      .string()
      .describe('Phone number in international format')
      .nullable(),
    contactType: z
      .string()
      .describe('Type of contact (e.g., customer service, sales)')
      .nullable(),
    email: z.email().nullable(),
    availableLanguage: z
      .union([z.string(), z.array(z.string())])
      .describe(
        'Language code(s) available for this contact point (e.g., en, es)'
      )
      .nullable(),
  })
  .meta({ id: 'ContactPointSchema' });

const MonetaryAmountSchema = z
  .object({
    '@type': z.literal('MonetaryAmount'),
    currency: z.string().describe('ISO 4217 currency code (e.g., USD)'),
    value: z.union([
      z.number(),
      z.object({
        '@type': z.literal('QuantitativeValue'),
        value: z.number(),
        unitText: z
          .string()
          .describe('Unit of measurement (e.g., HOUR, MONTH, YEAR)'),
      }),
    ]),
  })
  .meta({ id: 'MonetaryAmountSchema' });

// ============================================
// REQUESTED SCHEMAS (Exported)
// ============================================

export const EventSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Event'),
    name: z.string(),
    startDate: z
      .string()
      .describe(
        'ISO 8601 date-time when the event starts (e.g., 2024-03-15T19:00:00)'
      ),
    endDate: z
      .string()
      .describe('ISO 8601 date-time when the event ends')
      .nullable(),
    eventAttendanceMode: z
      .enum([
        'https://schema.org/OfflineEventAttendanceMode',
        'https://schema.org/OnlineEventAttendanceMode',
        'https://schema.org/MixedEventAttendanceMode',
      ])
      .nullable(),
    eventStatus: z
      .enum([
        'https://schema.org/EventScheduled',
        'https://schema.org/EventCancelled',
        'https://schema.org/EventMovedOnline',
        'https://schema.org/EventPostponed',
        'https://schema.org/EventRescheduled',
      ])
      .nullable(),
    location: z.union([PlaceSchema, VirtualLocationSchema]).nullable(),
    image: z.union([z.string(), z.array(z.string())]).nullable(),
    description: z.string().nullable(),
    organizer: z
      .union([
        z.object({
          '@type': z.enum(['Person', 'Organization']),
          name: z.string(),
          url: z.string().nullable(),
        }),
        z.string(),
      ])
      .nullable(),
    performer: z
      .union([
        z.object({
          '@type': z.enum(['Person', 'PerformingGroup']),
          name: z.string(),
        }),
        z.array(
          z.object({
            '@type': z.enum(['Person', 'PerformingGroup']),
            name: z.string(),
          })
        ),
      ])
      .nullable(),
    offers: z.union([OfferSchema, z.array(OfferSchema)]).nullable(),
  })
  .meta({ id: 'EventSchema' });

export const FAQPageSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('FAQPage'),
    mainEntity: z.array(
      z.object({
        '@type': z.literal('Question'),
        name: z.string().describe('The question text'),
        acceptedAnswer: z.object({
          '@type': z.literal('Answer'),
          text: z
            .string()
            .describe('The answer text (can include HTML markup)'),
        }),
      })
    ),
  })
  .meta({ id: 'FAQPageSchema' });

export const WebsiteSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('WebSite'),
    name: z.string(),
    url: z.string(),
    description: z.string().nullable(),
    potentialAction: z
      .object({
        '@type': z.literal('SearchAction'),
        target: z.object({
          '@type': z.literal('EntryPoint'),
          urlTemplate: z
            .string()
            .describe(
              'URL template for search with {search_term_string} placeholder (e.g., https://example.com/search?q={search_term_string})'
            ),
        }),
        'query-input': z
          .string()
          .describe(
            'Required query input format (e.g., required name=search_term_string)'
          ),
      })
      .describe('Sitelinks search box functionality')
      .nullable(),
    publisher: OrganizationBaseSchema.nullable(),
  })
  .meta({ id: 'WebsiteSchema' });

export const OrganizationSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.enum(['Organization', 'Corporation', 'LocalBusiness', 'NGO']),
    name: z.string(),
    url: z.string().nullable(),
    logo: z.union([z.string(), ImageObjectSchema]).nullable(),
    description: z.string().nullable(),
    address: z.union([z.string(), PostalAddressSchema]).nullable(),
    contactPoint: z
      .union([ContactPointSchema, z.array(ContactPointSchema)])
      .nullable(),
    sameAs: z
      .union([z.string(), z.array(z.string())])
      .describe(
        'URLs of social media profiles and other references to the organization'
      )
      .nullable(),
    foundingDate: z
      .string()
      .describe('ISO 8601 date when the organization was founded')
      .nullable(),
    founders: z.union([PersonSchema, z.array(PersonSchema)]).nullable(),
  })
  .meta({ id: 'OrganizationSchema' });

// ============================================
// TOP 10 MOST POPULAR SCHEMAS (Exported)
// ============================================

export const ArticleSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.enum(['Article', 'NewsArticle', 'BlogPosting']),
    headline: z
      .string()
      .describe(
        'Headline or title of the article (max 110 characters recommended)'
      ),
    image: z.union([z.string(), z.array(z.string())]).nullable(),
    author: z
      .union([
        z.object({
          '@type': z.enum(['Person', 'Organization']),
          name: z.string(),
          url: z.string().nullable(),
        }),
        z.array(
          z.object({
            '@type': z.enum(['Person', 'Organization']),
            name: z.string(),
          })
        ),
      ])
      .nullable(),
    publisher: OrganizationBaseSchema.nullable(),
    datePublished: z
      .string()
      .describe('ISO 8601 date when the article was first published')
      .nullable(),
    dateModified: z
      .string()
      .describe('ISO 8601 date when the article was last modified')
      .nullable(),
    description: z.string().nullable(),
    articleBody: z
      .string()
      .describe('Full text content of the article')
      .nullable(),
  })
  .meta({ id: 'ArticleSchema' });

export const ProductSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Product'),
    name: z.string(),
    image: z.union([z.string(), z.array(z.string())]).nullable(),
    description: z.string().nullable(),
    sku: z
      .string()
      .describe('Stock Keeping Unit - unique product identifier')
      .nullable(),
    mpn: z.string().describe('Manufacturer Part Number').nullable(),
    brand: z.union([BrandSchema, z.string()]).nullable(),
    offers: z.union([OfferSchema, z.array(OfferSchema)]).nullable(),
    aggregateRating: AggregateRatingSchema.nullable(),
    review: z
      .union([
        z.object({
          '@type': z.literal('Review'),
          author: PersonSchema,
          reviewRating: RatingSchema,
          reviewBody: z.string().nullable(),
        }),
        z.array(
          z.object({
            '@type': z.literal('Review'),
            author: PersonSchema,
            reviewRating: RatingSchema,
          })
        ),
      ])
      .nullable(),
  })
  .meta({ id: 'ProductSchema' });

export const LocalBusinessSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.enum(['LocalBusiness', 'Restaurant', 'Store', 'AutoRepair']),
    name: z.string(),
    image: z.union([z.string(), z.array(z.string())]).nullable(),
    '@id': z
      .string()
      .describe('Unique identifier for the business (usually the URL)')
      .nullable(),
    url: z.string().nullable(),
    telephone: z.string().nullable(),
    priceRange: z
      .string()
      .describe('Price range represented by $ symbols (e.g., $$, $$$)')
      .nullable(),
    address: PostalAddressSchema.nullable(),
    geo: GeoCoordinatesSchema.nullable(),
    openingHoursSpecification: z
      .union([
        OpeningHoursSpecificationSchema,
        z.array(OpeningHoursSpecificationSchema),
      ])
      .nullable(),
    aggregateRating: AggregateRatingSchema.nullable(),
  })
  .meta({ id: 'LocalBusinessSchema' });

export const BreadcrumbListSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('BreadcrumbList'),
    itemListElement: z.array(
      z.object({
        '@type': z.literal('ListItem'),
        position: z
          .number()
          .describe('Position in the breadcrumb trail (starts at 1)'),
        name: z.string(),
        item: z
          .string()
          .describe('URL of the page (omit for the current page)')
          .nullable(),
      })
    ),
  })
  .meta({ id: 'BreadcrumbListSchema' });

export const PersonExportedSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Person'),
    name: z.string(),
    url: z.string().nullable(),
    image: z.string().nullable(),
    jobTitle: z.string().nullable(),
    worksFor: OrganizationBaseSchema.nullable(),
    sameAs: z
      .union([z.string(), z.array(z.string())])
      .describe('URLs of social profiles and other references to the person')
      .nullable(),
    email: z.email().nullable(),
    telephone: z.string().nullable(),
    address: z.union([z.string(), PostalAddressSchema]).nullable(),
  })
  .meta({ id: 'PersonExportedSchema' });

export const RecipeSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Recipe'),
    name: z.string(),
    image: z.union([z.string(), z.array(z.string())]).nullable(),
    author: z
      .object({
        '@type': z.enum(['Person', 'Organization']),
        name: z.string(),
      })
      .nullable()
      .meta({ id: 'RecipeAuthorSchema' }),
    datePublished: z
      .string()
      .describe('ISO 8601 date when the recipe was published')
      .nullable(),
    description: z.string().nullable(),
    prepTime: z
      .string()
      .describe(
        'ISO 8601 duration for preparation time (e.g., PT15M for 15 minutes)'
      )
      .nullable(),
    cookTime: z
      .string()
      .describe(
        'ISO 8601 duration for cooking time (e.g., PT30M for 30 minutes)'
      )
      .nullable(),
    totalTime: z
      .string()
      .describe(
        'ISO 8601 duration for total time including prep and cook (e.g., PT45M)'
      )
      .nullable(),
    recipeYield: z
      .union([z.string(), z.number()])
      .describe('Number of servings the recipe makes (e.g., "4 servings" or 4)')
      .nullable(),
    recipeCategory: z
      .string()
      .describe('Type of meal or course (e.g., dinner, dessert, appetizer)')
      .nullable(),
    recipeCuisine: z
      .string()
      .describe(
        'Cuisine or region associated with the recipe (e.g., Italian, Mexican)'
      )
      .nullable(),
    keywords: z
      .string()
      .describe('Comma-separated keywords about the recipe')
      .nullable(),
    nutrition: NutritionInformationSchema.nullable(),
    recipeIngredient: z
      .array(z.string())
      .describe('List of ingredients with quantities (e.g., "2 cups flour")')
      .nullable(),
    recipeInstructions: z
      .union([z.array(z.string()), z.array(HowToStepSchema)])
      .describe('Step-by-step cooking instructions')
      .nullable(),
    aggregateRating: AggregateRatingSchema.nullable(),
  })
  .meta({ id: 'RecipeSchema' });

export const VideoObjectSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('VideoObject'),
    name: z.string(),
    description: z.string().nullable(),
    thumbnailUrl: z.union([z.string(), z.array(z.string())]).nullable(),
    uploadDate: z
      .string()
      .describe('ISO 8601 date when the video was uploaded')
      .nullable(),
    duration: z
      .string()
      .describe(
        'ISO 8601 duration of the video (e.g., PT1M30S for 1 minute 30 seconds)'
      )
      .nullable(),
    contentUrl: z.string().describe('Direct URL to the video file').nullable(),
    embedUrl: z.string().describe('URL to embed the video player').nullable(),
    publisher: OrganizationBaseSchema.nullable(),
  })
  .meta({ id: 'VideoObjectSchema' });

export const ReviewSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Review'),
    itemReviewed: z.object({
      '@type': z
        .string()
        .describe(
          'Type of item being reviewed (e.g., Product, LocalBusiness, Movie)'
        ),
      name: z.string(),
    }),
    author: PersonSchema.nullable(),
    reviewRating: RatingSchema.nullable(),
    reviewBody: z
      .string()
      .describe('The actual review text content')
      .nullable(),
    datePublished: z
      .string()
      .describe('ISO 8601 date when the review was published')
      .nullable(),
    publisher: OrganizationBaseSchema.nullable(),
  })
  .meta({ id: 'ReviewSchema' });

export const CourseSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('Course'),
    name: z.string(),
    description: z.string().nullable(),
    provider: z
      .object({
        '@type': z.literal('Organization'),
        name: z.string(),
        sameAs: z.string().nullable(),
      })
      .nullable(),
    offers: z
      .object({
        '@type': z.literal('Offer'),
        category: z
          .string()
          .describe('Category of the offer (e.g., Paid, Free)')
          .nullable(),
        price: z.union([z.string(), z.number()]).nullable(),
        priceCurrency: z
          .string()
          .describe('ISO 4217 currency code (e.g., USD)')
          .nullable(),
      })
      .nullable(),
    hasCourseInstance: z
      .union([
        z.object({
          '@type': z.literal('CourseInstance'),
          courseMode: z
            .string()
            .describe('Mode of instruction (e.g., online, in-person, blended)')
            .nullable(),
          startDate: z
            .string()
            .describe('ISO 8601 date when this instance starts')
            .nullable(),
          endDate: z
            .string()
            .describe('ISO 8601 date when this instance ends')
            .nullable(),
          instructor: PersonSchema.nullable(),
        }),
        z.array(
          z.object({
            '@type': z.literal('CourseInstance'),
            courseMode: z.string().describe('Mode of instruction').nullable(),
            startDate: z.string().nullable(),
          })
        ),
      ])
      .describe('Specific instance(s) of the course being offered')
      .nullable(),
  })
  .meta({ id: 'CourseSchema' });

export const JobPostingSchema = z
  .object({
    '@context': z.literal('https://schema.org').nullable(),
    '@type': z.literal('JobPosting'),
    title: z.string(),
    description: z
      .string()
      .describe(
        'Full description of the job including responsibilities and requirements (can include HTML)'
      ),
    datePosted: z.string().describe('ISO 8601 date when the job was posted'),
    validThrough: z
      .string()
      .describe('ISO 8601 date when the job posting expires')
      .nullable(),
    employmentType: z
      .union([z.string(), z.array(z.string())])
      .describe(
        'Type(s) of employment (e.g., FULL_TIME, PART_TIME, CONTRACTOR)'
      )
      .nullable(),
    hiringOrganization: z.object({
      '@type': z.literal('Organization'),
      name: z.string(),
      sameAs: z.string().nullable(),
      logo: z.string().nullable(),
    }),
    jobLocation: z.union([PlaceSchema, z.array(PlaceSchema)]).nullable(),
    baseSalary: MonetaryAmountSchema.nullable(),
  })
  .meta({ id: 'JobPostingSchema' });
