import { defineCollection, z } from "astro:content";

const customers = defineCollection({
  schema: ({ image }) =>
    z.object({
      customer: z.string(),
      bgColor: z.string().optional(),
      ctaTitle: z.string().optional(),
      testimonial: z.string().optional(),
      partnership: z.string().optional(),
      avatar: z.object({
        url: image(),
        alt: z.string(),
      }),
      challengesAndSolutions: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ),
      results: z.array(z.string()),
      about: z.string(),
      details: z.record(z.string()),
      logo: z.object({
        url: image(),
        alt: z.string(),
      }),
    }),
});
const integrations = defineCollection({
  schema: ({ image }) =>
    z.object({
      email: z.string(),
      integration: z.string(),
      description: z.string(),
      permissions: z.array(z.string()),
      details: z.array(
        z.object({
          title: z.string(),
          value: z.string(),
          url: z.optional(z.string()),
        })
      ),
      logo: z.object({
        url: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()),
    }),
});
const helpcenter = defineCollection({
  schema: z.object({
    iconId: z.string().optional(),
    page: z.string(),
    description: z.string(),
    category: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    lastUpdated: z.string().optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});
const changelog = defineCollection({
  schema: ({ image }) =>
    z.object({
      page: z.string(),
      description: z.string(),
      pubDate: z.date(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
    }),
});

const legal = defineCollection({
  schema: z.object({
    page: z.string(),
    pubDate: z.date(),
  }),
});
const team = defineCollection({
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string().optional(),
      bio: z.string().optional(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
      socials: z
        .object({
          twitter: z.string().optional(),
          website: z.string().optional(),
          linkedin: z.string().optional(),
          email: z.string().optional(),
        })
        .optional(),
    }),
});

const comparisons = defineCollection({
  schema: z.object({
    competitor: z.string(),
    competitorUrl: z.string().url(),
    competitorType: z.string(),
    pageTitle: z.string(),
    metaDescription: z.string(),
    publishedDate: z.string(),
    modifiedDate: z.string(),
    quickVerdict: z.object({
      summary: z.string(),
      bestForCompetitor: z.string(),
      bestForVowsYou: z.string(),
    }),
    qaItems: z.array(z.object({ q: z.string(), a: z.string() })),
    competitorStrengths: z.array(z.string()),
    competitorDrawbacks: z.array(z.string()),
    priceNote: z.string(),
    pickCompetitor: z.array(z.string()),
    pickVowsYou: z.array(z.string()),
    faqItems: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

const postsCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      team: z.string(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()),
    }),
});

export const collections = {
  team,
  customers,
  changelog,
  legal,
  helpcenter,
  posts: postsCollection,
  integrations,
  comparisons,
};
