import { useEffect } from 'react';
import { DEFAULT_SEO, SITE_NAME, SITE_URL } from '../seo/config';

export type PageSeoOptions = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(data?: Record<string, unknown> | Record<string, unknown>[]) {
  const id = 'page-json-ld';
  document.getElementById(id)?.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function usePageSeo({
  title,
  description = DEFAULT_SEO.description,
  path = '',
  keywords = DEFAULT_SEO.keywords,
  noindex = false,
  jsonLd,
}: PageSeoOptions) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonical = `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

    document.title = fullTitle;
    document.documentElement.lang = 'ko';

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:locale', 'ko_KR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);

    upsertLink('canonical', canonical);
    upsertJsonLd(jsonLd);

    return () => {
      document.getElementById('page-json-ld')?.remove();
    };
  }, [title, description, path, keywords, noindex, jsonLdKey, jsonLd]);
}
