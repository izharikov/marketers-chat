import { z } from 'zod';

export const NULL = z.literal(null)
    .describe('Null value')
    .meta({ id: 'NULL' })
    ;

// Utility function for optional fields in Vercel AI SDK
function optional<T>(schema: z.ZodType<T>) {
    return z.union([
        schema,
        NULL,
    ]);
}

// ============================================
// SHARED/REUSABLE SCHEMAS (Not Exported)
// ============================================

const ImageObjectSchema = z.object({
    '@type': z.literal('ImageObject'),
    url: z.string().describe('URL of the image'),
    width: optional(z.number().describe('Width of the image in pixels')),
    height: optional(z.number().describe('Height of the image in pixels')),
}).meta({ id: 'ImageObjectSchema' });

const PostalAddressSchema = z.object({
    '@type': z.literal('PostalAddress'),
    streetAddress: optional(z.string()),
    addressLocality: optional(z.string().describe('City or locality')),
    addressRegion: optional(z.string().describe('State, province, or region')),
    postalCode: optional(z.string()),
    addressCountry: optional(z.string().describe('Country name or ISO code')),
}).meta({ id: 'PostalAddressSchema' });

const GeoCoordinatesSchema = z.object({
    '@type': z.literal('GeoCoordinates'),
    latitude: z.number().describe('Latitude in decimal degrees'),
    longitude: z.number().describe('Longitude in decimal degrees'),
}).meta({ id: 'GeoCoordinatesSchema' });

const PersonSchema = z.object({
    '@type': z.literal('Person'),
    name: z.string(),
    url: optional(z.string()),
}).meta({ id: 'PersonSchema' });

const OrganizationBaseSchema = z.object({
    '@type': z.literal('Organization'),
    name: z.string(),
    url: optional(z.string()),
    logo: optional(z.union([
        z.string(),
        ImageObjectSchema,
    ])),
}).meta({ id: 'OrganizationBaseSchema' });

const OfferSchema = z.object({
    '@type': z.literal('Offer'),
    url: optional(z.string().describe('URL where the offer can be purchased')),
    price: optional(z.union([
        z.string(),
        z.number(),
    ])),
    priceCurrency: optional(z.string().describe('ISO 4217 currency code (e.g., USD, EUR)')),
    availability: optional(z.string().describe('Availability status URL from schema.org vocabulary (e.g., https://schema.org/InStock)')),
    validFrom: optional(z.string().describe('ISO 8601 date when the offer becomes valid')),
    priceValidUntil: optional(z.string().describe('ISO 8601 date when the price expires')),
    itemCondition: optional(z.string().describe('Condition URL from schema.org vocabulary (e.g., https://schema.org/NewCondition)')),
}).meta({ id: 'OfferSchema' });

const RatingSchema = z.object({
    '@type': z.literal('Rating'),
    ratingValue: z.union([
        z.string(),
        z.number(),
    ]),
    bestRating: optional(z.union([
        z.string(),
        z.number(),
    ]).describe('Best possible rating (default is 5)')),
    worstRating: optional(z.union([
        z.string(),
        z.number(),
    ]).describe('Worst possible rating (default is 1)')),
}).meta({ id: 'RatingSchema' });

const AggregateRatingSchema = z.object({
    '@type': z.literal('AggregateRating'),
    ratingValue: z.union([
        z.string(),
        z.number(),
    ]).describe('Average numeric rating'),
    reviewCount: optional(z.union([
        z.string(),
        z.number(),
    ])),
    ratingCount: optional(z.union([
        z.string(),
        z.number(),
    ])),
    bestRating: optional(z.union([
        z.string(),
        z.number(),
    ]).describe('Best possible rating (default is 5)')),
    worstRating: optional(z.union([
        z.string(),
        z.number(),
    ]).describe('Worst possible rating (default is 1)')),
}).meta({ id: 'AggregateRatingSchema' });

const PlaceSchema = z.object({
    '@type': z.literal('Place'),
    name: optional(z.string()),
    address: optional(z.union([
        z.string(),
        PostalAddressSchema,
    ])),
    geo: optional(GeoCoordinatesSchema),
}).meta({ id: 'PlaceSchema' });

const VirtualLocationSchema = z.object({
    '@type': z.literal('VirtualLocation'),
    url: z.string().describe('URL where the event can be attended virtually'),
}).meta({ id: 'VirtualLocationSchema' });

const BrandSchema = z.object({
    '@type': z.literal('Brand'),
    name: z.string(),
}).meta({ id: 'BrandSchema' });

const OpeningHoursSpecificationSchema = z.object({
    '@type': z.literal('OpeningHoursSpecification'),
    dayOfWeek: z.union([
        z.string(),
        z.array(z.string()),
    ]).describe('Day(s) of the week (e.g., Monday, Tuesday)'),
    opens: z.string().describe('Opening time in HH:MM format (e.g., 09:00)'),
    closes: z.string().describe('Closing time in HH:MM format (e.g., 17:00)'),
}).meta({ id: 'OpeningHoursSpecificationSchema' });

const HowToStepSchema = z.object({
    '@type': z.literal('HowToStep'),
    text: z.string(),
    name: optional(z.string()),
    url: optional(z.string()),
}).meta({ id: 'HowToStepSchema' });

const NutritionInformationSchema = z.object({
    '@type': z.literal('NutritionInformation'),
    calories: optional(z.string().describe('Calorie count (e.g., "250 calories")')),
}).meta({ id: 'NutritionInformationSchema' });

const ContactPointSchema = z.object({
    '@type': z.literal('ContactPoint'),
    telephone: optional(z.string().describe('Phone number in international format')),
    contactType: optional(z.string().describe('Type of contact (e.g., customer service, sales)')),
    email: optional(z.string().email()),
    availableLanguage: optional(z.union([
        z.string(),
        z.array(z.string()),
    ]).describe('Language code(s) available for this contact point (e.g., en, es)')),
}).meta({ id: 'ContactPointSchema' });

const MonetaryAmountSchema = z.object({
    '@type': z.literal('MonetaryAmount'),
    currency: z.string().describe('ISO 4217 currency code (e.g., USD)'),
    value: z.union([
        z.number(),
        z.object({
            '@type': z.literal('QuantitativeValue'),
            value: z.number(),
            unitText: z.string().describe('Unit of measurement (e.g., HOUR, MONTH, YEAR)'),
        }),
    ]),
}).meta({ id: 'MonetaryAmountSchema' });

// ============================================
// REQUESTED SCHEMAS (Exported)
// ============================================

export const EventSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Event'),
    name: z.string(),
    startDate: z.string().describe('ISO 8601 date-time when the event starts (e.g., 2024-03-15T19:00:00)'),
    endDate: optional(z.string().describe('ISO 8601 date-time when the event ends')),
    eventAttendanceMode: optional(z.enum([
        'https://schema.org/OfflineEventAttendanceMode',
        'https://schema.org/OnlineEventAttendanceMode',
        'https://schema.org/MixedEventAttendanceMode'
    ])),
    eventStatus: optional(z.enum([
        'https://schema.org/EventScheduled',
        'https://schema.org/EventCancelled',
        'https://schema.org/EventMovedOnline',
        'https://schema.org/EventPostponed',
        'https://schema.org/EventRescheduled'
    ])),
    location: optional(z.union([
        PlaceSchema,
        VirtualLocationSchema,
    ])),
    image: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    description: optional(z.string()),
    organizer: optional(z.union([
        z.object({
            '@type': z.enum(['Person', 'Organization']),
            name: z.string(),
            url: optional(z.string()),
        }),
        z.string(),
    ])),
    performer: optional(z.union([
        z.object({
            '@type': z.enum(['Person', 'PerformingGroup']),
            name: z.string(),
        }),
        z.array(z.object({
            '@type': z.enum(['Person', 'PerformingGroup']),
            name: z.string(),
        })),
    ])),
    offers: optional(z.union([
        OfferSchema,
        z.array(OfferSchema),
    ])),
}).meta({ id: 'EventSchema' });

export const FAQPageSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('FAQPage'),
    mainEntity: z.array(z.object({
        '@type': z.literal('Question'),
        name: z.string().describe('The question text'),
        acceptedAnswer: z.object({
            '@type': z.literal('Answer'),
            text: z.string().describe('The answer text (can include HTML markup)'),
        }),
    })),
}).meta({ id: 'FAQPageSchema' });

export const WebsiteSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('WebSite'),
    name: z.string(),
    url: z.string(),
    description: optional(z.string()),
    potentialAction: optional(z.object({
        '@type': z.literal('SearchAction'),
        target: z.object({
            '@type': z.literal('EntryPoint'),
            urlTemplate: z.string().describe('URL template for search with {search_term_string} placeholder (e.g., https://example.com/search?q={search_term_string})'),
        }),
        'query-input': z.string().describe('Required query input format (e.g., required name=search_term_string)'),
    }).describe('Sitelinks search box functionality')),
    publisher: optional(OrganizationBaseSchema),
}).meta({ id: 'WebsiteSchema' });

export const OrganizationSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.enum(['Organization', 'Corporation', 'LocalBusiness', 'NGO']),
    name: z.string(),
    url: optional(z.string()),
    logo: optional(z.union([
        z.string(),
        ImageObjectSchema,
    ])),
    description: optional(z.string()),
    address: optional(z.union([
        z.string(),
        PostalAddressSchema,
    ])),
    contactPoint: optional(z.union([
        ContactPointSchema,
        z.array(ContactPointSchema),
    ])),
    sameAs: optional(z.union([
        z.string(),
        z.array(z.string()),
    ]).describe('URLs of social media profiles and other references to the organization')),
    foundingDate: optional(z.string().describe('ISO 8601 date when the organization was founded')),
    founders: optional(z.union([
        PersonSchema,
        z.array(PersonSchema),
    ])),
}).meta({ id: 'OrganizationSchema' });

// ============================================
// TOP 10 MOST POPULAR SCHEMAS (Exported)
// ============================================

export const ArticleSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.enum(['Article', 'NewsArticle', 'BlogPosting']),
    headline: z.string().describe('Headline or title of the article (max 110 characters recommended)'),
    image: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    author: optional(z.union([
        z.object({
            '@type': z.enum(['Person', 'Organization']),
            name: z.string(),
            url: optional(z.string()),
        }),
        z.array(z.object({
            '@type': z.enum(['Person', 'Organization']),
            name: z.string(),
        })),
    ])),
    publisher: optional(OrganizationBaseSchema),
    datePublished: optional(z.string().describe('ISO 8601 date when the article was first published')),
    dateModified: optional(z.string().describe('ISO 8601 date when the article was last modified')),
    description: optional(z.string()),
    articleBody: optional(z.string().describe('Full text content of the article')),
}).meta({ id: 'ArticleSchema' });

export const ProductSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Product'),
    name: z.string(),
    image: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    description: optional(z.string()),
    sku: optional(z.string().describe('Stock Keeping Unit - unique product identifier')),
    mpn: optional(z.string().describe('Manufacturer Part Number')),
    brand: optional(z.union([
        BrandSchema,
        z.string(),
    ])),
    offers: optional(z.union([
        OfferSchema,
        z.array(OfferSchema),
    ])),
    aggregateRating: optional(AggregateRatingSchema),
    review: optional(z.union([
        z.object({
            '@type': z.literal('Review'),
            author: PersonSchema,
            reviewRating: RatingSchema,
            reviewBody: optional(z.string()),
        }),
        z.array(z.object({
            '@type': z.literal('Review'),
            author: PersonSchema,
            reviewRating: RatingSchema,
        })),
    ])),
}).meta({ id: 'ProductSchema' });

export const LocalBusinessSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.enum(['LocalBusiness', 'Restaurant', 'Store', 'AutoRepair']),
    name: z.string(),
    image: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    '@id': optional(z.string().describe('Unique identifier for the business (usually the URL)')),
    url: optional(z.string()),
    telephone: optional(z.string()),
    priceRange: optional(z.string().describe('Price range represented by $ symbols (e.g., $$, $$$)')),
    address: optional(PostalAddressSchema),
    geo: optional(GeoCoordinatesSchema),
    openingHoursSpecification: optional(z.union([
        OpeningHoursSpecificationSchema,
        z.array(OpeningHoursSpecificationSchema),
    ])),
    aggregateRating: optional(AggregateRatingSchema),
}).meta({ id: 'LocalBusinessSchema' });

export const BreadcrumbListSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('BreadcrumbList'),
    itemListElement: z.array(z.object({
        '@type': z.literal('ListItem'),
        position: z.number().describe('Position in the breadcrumb trail (starts at 1)'),
        name: z.string(),
        item: optional(z.string().describe('URL of the page (omit for the current page)')),
    })),
}).meta({ id: 'BreadcrumbListSchema' });

export const PersonExportedSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Person'),
    name: z.string(),
    url: optional(z.string()),
    image: optional(z.string()),
    jobTitle: optional(z.string()),
    worksFor: optional(OrganizationBaseSchema),
    sameAs: optional(z.union([
        z.string(),
        z.array(z.string()),
    ]).describe('URLs of social profiles and other references to the person')),
    email: optional(z.string().email()),
    telephone: optional(z.string()),
    address: optional(z.union([
        z.string(),
        PostalAddressSchema,
    ])),
}).meta({ id: 'PersonExportedSchema' });

export const RecipeSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Recipe'),
    name: z.string(),
    image: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    author: optional(z.object({
        '@type': z.enum(['Person', 'Organization']),
        name: z.string(),
    })).meta({ id: 'RecipeAuthorSchema' }),
    datePublished: optional(z.string().describe('ISO 8601 date when the recipe was published')),
    description: optional(z.string()),
    prepTime: optional(z.string().describe('ISO 8601 duration for preparation time (e.g., PT15M for 15 minutes)')),
    cookTime: optional(z.string().describe('ISO 8601 duration for cooking time (e.g., PT30M for 30 minutes)')),
    totalTime: optional(z.string().describe('ISO 8601 duration for total time including prep and cook (e.g., PT45M)')),
    recipeYield: optional(z.union([
        z.string(),
        z.number(),
    ]).describe('Number of servings the recipe makes (e.g., "4 servings" or 4)')),
    recipeCategory: optional(z.string().describe('Type of meal or course (e.g., dinner, dessert, appetizer)')),
    recipeCuisine: optional(z.string().describe('Cuisine or region associated with the recipe (e.g., Italian, Mexican)')),
    keywords: optional(z.string().describe('Comma-separated keywords about the recipe')),
    nutrition: optional(NutritionInformationSchema),
    recipeIngredient: optional(z.array(z.string()).describe('List of ingredients with quantities (e.g., "2 cups flour")')),
    recipeInstructions: optional(z.union([
        z.array(z.string()),
        z.array(HowToStepSchema),
    ]).describe('Step-by-step cooking instructions')),
    aggregateRating: optional(AggregateRatingSchema),
}).meta({ id: 'RecipeSchema' });

export const VideoObjectSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('VideoObject'),
    name: z.string(),
    description: optional(z.string()),
    thumbnailUrl: optional(z.union([
        z.string(),
        z.array(z.string()),
    ])),
    uploadDate: optional(z.string().describe('ISO 8601 date when the video was uploaded')),
    duration: optional(z.string().describe('ISO 8601 duration of the video (e.g., PT1M30S for 1 minute 30 seconds)')),
    contentUrl: optional(z.string().describe('Direct URL to the video file')),
    embedUrl: optional(z.string().describe('URL to embed the video player')),
    publisher: optional(OrganizationBaseSchema),
}).meta({ id: 'VideoObjectSchema' });

export const ReviewSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Review'),
    itemReviewed: z.object({
        '@type': z.string().describe('Type of item being reviewed (e.g., Product, LocalBusiness, Movie)'),
        name: z.string(),
    }),
    author: optional(PersonSchema),
    reviewRating: optional(RatingSchema),
    reviewBody: optional(z.string().describe('The actual review text content')),
    datePublished: optional(z.string().describe('ISO 8601 date when the review was published')),
    publisher: optional(OrganizationBaseSchema),
}).meta({ id: 'ReviewSchema' });

export const CourseSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('Course'),
    name: z.string(),
    description: optional(z.string()),
    provider: optional(z.object({
        '@type': z.literal('Organization'),
        name: z.string(),
        sameAs: optional(z.string()),
    })),
    offers: optional(z.object({
        '@type': z.literal('Offer'),
        category: optional(z.string().describe('Category of the offer (e.g., Paid, Free)')),
        price: optional(z.union([
            z.string(),
            z.number(),
        ])),
        priceCurrency: optional(z.string().describe('ISO 4217 currency code (e.g., USD)')),
    })),
    hasCourseInstance: optional(z.union([
        z.object({
            '@type': z.literal('CourseInstance'),
            courseMode: optional(z.string().describe('Mode of instruction (e.g., online, in-person, blended)')),
            startDate: optional(z.string().describe('ISO 8601 date when this instance starts')),
            endDate: optional(z.string().describe('ISO 8601 date when this instance ends')),
            instructor: optional(PersonSchema),
        }),
        z.array(z.object({
            '@type': z.literal('CourseInstance'),
            courseMode: optional(z.string().describe('Mode of instruction')),
            startDate: optional(z.string()),
        })),
    ]).describe('Specific instance(s) of the course being offered')),
}).meta({ id: 'CourseSchema' });

export const JobPostingSchema = z.object({
    '@context': optional(z.literal('https://schema.org')),
    '@type': z.literal('JobPosting'),
    title: z.string(),
    description: z.string().describe('Full description of the job including responsibilities and requirements (can include HTML)'),
    datePosted: z.string().describe('ISO 8601 date when the job was posted'),
    validThrough: optional(z.string().describe('ISO 8601 date when the job posting expires')),
    employmentType: optional(z.union([
        z.string(),
        z.array(z.string()),
    ]).describe('Type(s) of employment (e.g., FULL_TIME, PART_TIME, CONTRACTOR)')),
    hiringOrganization: z.object({
        '@type': z.literal('Organization'),
        name: z.string(),
        sameAs: optional(z.string()),
        logo: optional(z.string()),
    }),
    jobLocation: optional(z.union([
        PlaceSchema,
        z.array(PlaceSchema),
    ])),
    baseSalary: optional(MonetaryAmountSchema),
}).meta({ id: 'JobPostingSchema' });
