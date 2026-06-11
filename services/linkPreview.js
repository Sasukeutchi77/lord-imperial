const previewCache = new Map();

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

const decodeHtmlEntities = (value = '') =>
  String(value || '').replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, (entity) => HTML_ENTITIES[entity] || entity);

const cleanText = (value = '') => decodeHtmlEntities(String(value || '').replace(/\s+/g, ' ').trim());

const resolveUrl = (candidate, baseUrl) => {
  if (!candidate) return null;

  try {
    return new URL(candidate, baseUrl).toString();
  } catch (_error) {
    return null;
  }
};

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (_error) {
    return url;
  }
};

const matchMetaContent = (html, patterns = []) => {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }
  return '';
};

const parsePreviewFromHtml = (html, url) => {
  const title =
    matchMetaContent(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    ]) || getDomain(url);

  const description = matchMetaContent(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  ]);

  const imageCandidate = matchMetaContent(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  ]);

  return {
    url,
    domain: getDomain(url),
    title,
    description,
    image: resolveUrl(imageCandidate, url),
  };
};

const fetchHtmlWithTimeout = async (url, timeoutMs = 7000) => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = String(response.headers?.get?.('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return '';
    }

    return await response.text();
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const getLinkPreview = async (rawUrl) => {
  const safeUrl = String(rawUrl || '').trim();
  if (!safeUrl) return null;

  if (previewCache.has(safeUrl)) {
    return previewCache.get(safeUrl);
  }

  let normalizedUrl = safeUrl;
  try {
    normalizedUrl = new URL(safeUrl).toString();
  } catch (_error) {
    return null;
  }

  const fallback = {
    url: normalizedUrl,
    domain: getDomain(normalizedUrl),
    title: getDomain(normalizedUrl),
    description: '',
    image: null,
  };

  const pending = (async () => {
    try {
      const html = await fetchHtmlWithTimeout(normalizedUrl);
      if (!html) return fallback;
      const preview = parsePreviewFromHtml(html, normalizedUrl);
      return {
        ...fallback,
        ...preview,
      };
    } catch (_error) {
      return fallback;
    }
  })();

  previewCache.set(safeUrl, pending);
  const resolved = await pending;
  previewCache.set(safeUrl, resolved);
  return resolved;
};

export const clearLinkPreviewCache = () => {
  previewCache.clear();
};
