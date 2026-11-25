import { CONVERTER_TOOLS, getToolByPath } from '../data/tools';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function injectRouteSeoMeta(html: string, pathname: string, baseUrl: string): string {
  const tool = getToolByPath(pathname);
  const safeTitle = escapeHtmlAttr(tool.metaTitle);
  const safeDesc = escapeHtmlAttr(tool.metaDescription);
  const canonicalUrl = `${baseUrl.replace(/\/+$/, '')}${tool.slug === '/' ? '' : tool.slug}`;
  const safeUrl = escapeHtmlAttr(canonicalUrl);

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    url: canonicalUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description: tool.metaDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  let updated = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${safeDesc}" />`
    );

  const extraHeadTags = [
    `<link rel="canonical" href="${safeUrl}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');

  updated = updated.replace('</head>', `    ${extraHeadTags}\n  </head>`);
  return updated;
}

export function generateSitemapXml(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const lastMod = new Date().toISOString().split('T')[0];

  const urls = CONVERTER_TOOLS.map((tool) => {
    const loc = `${cleanBase}${tool.slug === '/' ? '/' : tool.slug}`;
    const priority = tool.slug === '/' ? '1.0' : '0.9';
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function generateSitemapEntries(baseUrl: string) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const lastModified = new Date().toISOString();
  return CONVERTER_TOOLS.map((tool) => ({
    url: `${cleanBase}${tool.slug === '/' ? '' : tool.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: tool.slug === '/' ? 1.0 : 0.9,
  }));
}
