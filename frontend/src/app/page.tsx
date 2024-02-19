'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // TODO: ログインユーザーの種類によって遷移先を変更
    router.push('/login')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}
