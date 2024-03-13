import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export const useTokenFetchStatus = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isTokenFetched, setIsTokenFetched] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    return setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (status === 'authenticated') {
      setIsTokenFetched(true)
    }
  }, [isLoading, status])

  return { isTokenFetched, setIsTokenFetched }
}
