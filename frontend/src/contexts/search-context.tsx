'use client'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { SearchContextType, SearchFunction } from '@/types/search-context'

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const onSearchRef = useRef<SearchFunction | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setOnSearch = useCallback((searchFn: SearchFunction | null) => {
    onSearchRef.current = searchFn
  }, [])

  const contextValue = {
    onSearch: onSearchRef.current,
    setOnSearch,
    isLoading,
    setIsLoading,
  }

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
