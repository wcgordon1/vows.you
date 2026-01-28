import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  return rss({
    title: 'vows.you — Guides for writing wedding vows',
    description: 'Tips, examples, and advice for writing wedding vows that sound like you. Personal, not generic.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/guides/${post.slug}/`,
    })),
  });
}
