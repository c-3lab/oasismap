'use client'
import { createContext, useState, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

export const LoadingContext = createContext({
  isFetching: false,
  setIsFetching: (_: boolean) => {},
  isLoading: false,
  setIsLoading: (_: boolean) => {},
})

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  console.log(isLoading)
  console.log(isFetching)

  return (
    <>
      <LoadingContext.Provider
        value={{ isFetching, setIsFetching, isLoading, setIsLoading }}
      >
        {children}
      </LoadingContext.Provider>
      {(isFetching || isLoading) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={80} />
        </div>
      )}
    </>
  )
}
