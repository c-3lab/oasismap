import { createContext, useContext, useState, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

export const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: (_: boolean) => {},
  unsetLoading: () => {},
})

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)
  const unsetLoading = () => setIsLoading(false)

  return (
    <>
      <LoadingContext.Provider
        value={{ isLoading, setIsLoading, unsetLoading }}
      >
        {children}
      </LoadingContext.Provider>
      {isLoading && (
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
            zIndex: 450,
          }}
        >
          <CircularProgress size={40} />
        </div>
      )}
    </>
  )
}

export const useLoading = () => useContext(LoadingContext)
