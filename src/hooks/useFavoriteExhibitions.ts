import { useCallback, useMemo, useState } from 'react'
import { favoriteExhibitions } from '../features/user/data/myPageMock'

const FAVORITE_STORAGE_KEY = 'arbit.favoriteExhibitionIds'

const defaultFavoriteIds = favoriteExhibitions
  .filter((item) => item.liked)
  .map((item) => item.id)

function readFavoriteIds() {
  if (typeof window === 'undefined') {
    return defaultFavoriteIds
  }

  const storedFavoriteIds = window.localStorage.getItem(FAVORITE_STORAGE_KEY)

  if (!storedFavoriteIds) {
    return defaultFavoriteIds
  }

  try {
    const parsedFavoriteIds = JSON.parse(storedFavoriteIds)

    if (Array.isArray(parsedFavoriteIds)) {
      return parsedFavoriteIds.filter((id): id is string => typeof id === 'string')
    }
  } catch {
    window.localStorage.removeItem(FAVORITE_STORAGE_KEY)
  }

  return defaultFavoriteIds
}

export function useFavoriteExhibitions() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavoriteIds)

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((currentIds) => {
      const nextFavoriteIdSet = new Set(currentIds)

      if (nextFavoriteIdSet.has(id)) {
        nextFavoriteIdSet.delete(id)
      } else {
        nextFavoriteIdSet.add(id)
      }

      const nextFavoriteIds = Array.from(nextFavoriteIdSet)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(nextFavoriteIds))
      }

      return nextFavoriteIds
    })
  }, [])

  return {
    favoriteIdSet,
    toggleFavorite,
  }
}
