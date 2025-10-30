import { useState, useMemo, useCallback } from 'react'

interface UseInfinitePaginationOptions<T> {
  initialPage?: number
  limit?: number
  data?: T[]
  currentPage?: number
  hasMore?: boolean
  isFetching?: boolean
}

export function useInfinitePagination<T extends { id: string }>(
  options: UseInfinitePaginationOptions<T>
) {
  const {
    initialPage = 1,
    limit = 20,
    data = [],
    currentPage = 1,
    hasMore = false,
    isFetching = false,
  } = options

  const [page, setPage] = useState(initialPage)
  const [allItems, setAllItems] = useState<T[]>([])

  useMemo(() => {
    if (data.length > 0) {
      if (currentPage === 1) {
        setAllItems(data)
      } else {
        setAllItems((prev) => {
          const incomingIds = new Set(data.map((item) => item.id))
          const filteredPrev = prev.filter((item) => !incomingIds.has(item.id))
          return [...filteredPrev, ...data]
        })
      }
    }
  }, [data, currentPage])

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1)
    }
  }, [hasMore, isFetching])

  const reset = useCallback(() => {
    setPage(initialPage)
    setAllItems([])
  }, [initialPage])

  const setPageNumber = useCallback((pageNum: number) => {
    setPage(pageNum)
  }, [])

  return {
    items: allItems,
    page,
    limit,
    hasMore,
    isFetching,
    loadMore,
    reset,
    setPageNumber,
    totalItems: allItems.length,
  }
}


