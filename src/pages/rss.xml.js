import rss, { pagesGlobToRssItems } from '@astrojs/rss';
export async function GET(context) {
  return rss({
     title: 'vows.you — Guides for writing wedding vows',
    description: 'Tips, examples, and advice for writing wedding vows that sound like you. Personal, not generic.',
    site: context.site,
    items: await pagesGlobToRssItems(
      import.meta.glob('./blog/*.{md,mdx}'),
    ),
  });
}