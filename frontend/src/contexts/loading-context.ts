import { createContext } from 'react'

export const LoadingContext = createContext({
  isFetching: false,
  setIsFetching: (_: boolean) => {},
  isLoading: false,
  setIsLoading: (_: boolean) => {},
})
