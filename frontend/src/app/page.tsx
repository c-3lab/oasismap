'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // TODO: ログインユーザーの種類によって遷移先を変更
    // TODO: 利用者の幸福度画面のモック完成後はモック用実装として /happiness/me に遷移
    router.push('/happiness/all')
  }, [])

  return <></>
}
