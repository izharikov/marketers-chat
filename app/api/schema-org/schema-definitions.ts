import { z } from 'zod/v4';

// Event Schema
export const EventSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Event'),
    name: z.string(),
    startDate: z.string(), // ISO 8601 date-time
    location: z.object({
        '@type': z.literal('Place'),
        name: z.string(),
        address: z.string(),
    }),
});

// FAQPage Schema
export const FAQPageSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('FAQPage'),
    mainEntity: z.array(z.object({
        '@type': z.literal('Question'),
        name: z.string(),
        acceptedAnswer: z.object({
            '@type': z.literal('Answer'),
            text: z.string(),
        }),
    })),
});

// Website Schema
export const WebsiteSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('WebSite'),
    name: z.string(),
    url: z.string(),
});

// Organization Schema
export const OrganizationSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Organization'),
    name: z.string(),
    url: z.string(),
});

// Article Schema
export const ArticleSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Article'),
    headline: z.string(),
    author: z.object({
        '@type': z.literal('Person'),
        name: z.string(),
    }),
    datePublished: z.string(),
});

// Product Schema
export const ProductSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Product'),
    name: z.string(),
    image: z.string(),
    description: z.string(),
    offers: z.object({
        '@type': z.literal('Offer'),
        price: z.string(),
        priceCurrency: z.string(),
    }),
});

// LocalBusiness Schema
export const LocalBusinessSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('LocalBusiness'),
    name: z.string(),
    address: z.object({
        '@type': z.literal('PostalAddress'),
        streetAddress: z.string(),
        addressLocality: z.string(),
        addressCountry: z.string(),
    }),
});

// BreadcrumbList Schema
export const BreadcrumbListSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('BreadcrumbList'),
    itemListElement: z.array(z.object({
        '@type': z.literal('ListItem'),
        position: z.number(),
        name: z.string(),
        item: z.string(),
    })),
});

// Person Schema
export const PersonSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Person'),
    name: z.string(),
});

// Recipe Schema
export const RecipeSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Recipe'),
    name: z.string(),
    recipeIngredient: z.array(z.string()),
    recipeInstructions: z.array(z.string()),
});

// VideoObject Schema
export const VideoObjectSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('VideoObject'),
    name: z.string(),
    description: z.string(),
    thumbnailUrl: z.string(),
    uploadDate: z.string(),
});

// Review Schema
export const ReviewSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Review'),
    itemReviewed: z.object({
        '@type': z.literal('Product'),
        name: z.string(),
    }),
    reviewRating: z.object({
        '@type': z.literal('Rating'),
        ratingValue: z.number(),
    }),
    author: z.object({
        '@type': z.literal('Person'),
        name: z.string(),
    }),
});

// Course Schema
export const CourseSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('Course'),
    name: z.string(),
    description: z.string(),
    provider: z.object({
        '@type': z.literal('Organization'),
        name: z.string(),
    }),
});

// JobPosting Schema
export const JobPostingSchema = z.object({
    '@context': z.literal('https://schema.org'),
    '@type': z.literal('JobPosting'),
    title: z.string(),
    description: z.string(),
    datePosted: z.string(),
    hiringOrganization: z.object({
        '@type': z.literal('Organization'),
        name: z.string(),
    }),
});