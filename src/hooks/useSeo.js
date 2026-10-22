import { useEffect } from 'react';
import { canonicalUrl, ldGraph, pageMeta } from '../lib/seo.js';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setAlternates(list) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const { hreflang, href } of list) {
    const el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = hreflang;
    el.href = href;
    document.head.appendChild(el);
  }
}

// Keep <head> in step with the current screen during client-side navigation.
export default function useSeo(page, param, lang) {
  useEffect(() => {
    if (!page || page === 'loading') return;
    const m = pageMeta(page, param, lang);
    const url = canonicalUrl(m.path);
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('name', 'robots', m.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', m.type);
    setMeta('property', 'og:locale', m.ogLocale);
    setMeta('property', 'og:image', m.image);
    setMeta('name', 'twitter:image', m.image);
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.description);
    setLink('canonical', url);
    setAlternates(m.alternates);

    let ld = document.getElementById('ld-json');
    if (m.jsonLd.length) {
      if (!ld) {
        ld = document.createElement('script');
        ld.id = 'ld-json';
        ld.type = 'application/ld+json';
        document.head.appendChild(ld);
      }
      ld.textContent = ldGraph(m.jsonLd);
    } else if (ld) {
      ld.remove();
    }
  }, [page, param, lang]);
}
