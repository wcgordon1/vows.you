const SITE_URL = "https://vows.you";

interface ArticleSchemaInput {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

export function buildArticleSchema({
  url,
  headline,
  description,
  datePublished,
  dateModified,
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline,
    description,
    image: `${SITE_URL}/og-image.jpg`,
    datePublished: datePublished.includes("T")
      ? datePublished
      : `${datePublished}T00:00:00Z`,
    dateModified: dateModified.includes("T")
      ? dateModified
      : `${dateModified}T00:00:00Z`,
    author: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "vows.you",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "vows.you",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
        width: 124,
        height: 118,
      },
    },
    about: {
      "@type": "Thing",
      name: "Wedding vow writing tool comparison",
      description,
    },
    inLanguage: "en-US",
  };
}

interface BreadcrumbSchemaInput {
  url: string;
  competitorName: string;
}

export function buildBreadcrumbSchema({
  url,
  competitorName,
}: BreadcrumbSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Comparisons",
        item: `${SITE_URL}/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Vows.you vs ${competitorName}`,
        item: url,
      },
    ],
  };
}

interface FaqItem {
  q: string;
  a: string;
}

export function buildFaqSchema(faqItems: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
