import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { ApiResponse } from '@linkvault/shared';

export function useFetchLinkTitle(url: string) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setFetchedTitle(null);
      setLastFetchedUrl('');
      return;
    }

    if (url === lastFetchedUrl) {
      return;
    }

    let urlToFetch = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToFetch = `https://${url}`;
    }

    let isValid = false;
    try {
      new URL(urlToFetch);
      isValid = true;
    } catch {
      setFetchedTitle(null);
      return;
    }

    if (!isValid) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchTitle = async () => {
        setIsFetching(true);
        try {
          const response = await api.get<ApiResponse<{ title: string }>>(
            `/scraper/fetch-title?url=${encodeURIComponent(urlToFetch)}`
          );
          if (response.data.data?.title) {
            setFetchedTitle(response.data.data.title);
            setLastFetchedUrl(url);
          }
        } catch (error) {
          console.error('Error fetching title:', error);
          try {
            const urlObj = new URL(urlToFetch);
            const domain = urlObj.hostname.replace('www.', '');
            setFetchedTitle(domain);
            setLastFetchedUrl(url);
          } catch {
            setFetchedTitle(null);
          }
        } finally {
          setIsFetching(false);
        }
      };

      fetchTitle();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [url, lastFetchedUrl]);

  return { fetchedTitle, isFetching };
}

