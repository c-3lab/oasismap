'use client'
import { useState, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { LoadingContext } from '@/contexts/loading-context'

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
