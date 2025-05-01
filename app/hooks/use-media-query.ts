import { useState, useEffect, useLayoutEffect } from 'react'

const getMatches = (query: string): boolean => {
  // Prevents SSR issues
  if (typeof window !== 'undefined') {
    return window.matchMedia(query).matches
  }
  return false
}

/**
 * Returns true if the given media query matches.
 * Returns undefined until the first render occurred to prevent hydration errors.
 * @param query A media query as string
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [hasMatch, setHasMatches] = useState<boolean>(getMatches(query))
  const [initialLoad, setInitialLoad] = useState(true)

  useLayoutEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
    }
  }, [])

  function handleChange() {
    setHasMatches(getMatches(query))
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener('change', handleChange)
    return () => {
      matchMedia.removeEventListener('change', handleChange)
    }
  }, [query])

  return initialLoad ? undefined : hasMatch
} 