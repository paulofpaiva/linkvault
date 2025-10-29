import * as cheerio from 'cheerio';

function extractFallbackTitle(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.replace('www.', '');
    
    const pathParts = urlObj.pathname
      .split('/')
      .filter(part => part && !part.match(/^\d+$/) && part.length > 2);
    
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]+$/, '')
        .replace(/\b\w/g, c => c.toUpperCase());
      
      if (lastPart.length > 3) {
        return `${lastPart} - ${hostname}`;
      }
    }
    
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return 'Untitled Link';
  }
}

export async function fetchPageTitle(url: string): Promise<string> {
  const fallbackTitle = extractFallbackTitle(url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[Scraper] Response not OK (${response.status}), using fallback`);
      return fallbackTitle;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.log(`[Scraper] Not HTML content (${contentType}), using fallback`);
      return fallbackTitle;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let title = $('title').text().trim();
    
    if (!title) {
      title = $('meta[property="og:title"]').attr('content')?.trim() || '';
    }
    
    if (!title) {
      title = $('meta[name="twitter:title"]').attr('content')?.trim() || '';
    }
    
    if (!title) {
      title = $('h1').first().text().trim();
    }

    if (!title || title.length < 2) {
      console.log(`[Scraper] No valid title found, using fallback`);
      return fallbackTitle;
    }

    console.log(`[Scraper] Title found: ${title}`);
    return title;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`[Scraper] Request timeout for ${url}, using fallback`);
    } else {
      console.log(`[Scraper] Error fetching ${url}:`, error.message);
    }
    return fallbackTitle;
  }
}
