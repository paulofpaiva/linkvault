import { useState, useEffect, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px' } = options

  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        callback()
      }
    },
    [callback, hasMore, isLoading]
  )

  useEffect(() => {
    if (!sentinelRef) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    })

    observer.observe(sentinelRef)

    return () => {
      observer.unobserve(sentinelRef)
    }
  }, [sentinelRef, handleIntersection, threshold, rootMargin])

  return setSentinelRef
}


