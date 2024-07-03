'use client'
import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { ERROR_TYPE } from '@/libs/constants'

const TokenChecker = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const { data: session, update } = useSession()

  useEffect(() => {
    const changedVisibilityState = async () => {
      if (document.visibilityState === 'visible') {
        await update()
      }
    }

    document.addEventListener('visibilitychange', changedVisibilityState)

    return () => {
      document.removeEventListener('visibilitychange', changedVisibilityState)
    }
  }, [update])

  useEffect(() => {
    if (session?.error === ERROR_TYPE.REFRESH_ACCESS_TOKEN_ERROR) {
      noticeMessageContext.showMessage(
        '再ログインしてください',
        MessageType.Error
      )
      signOut({ redirect: false })
      router.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return <></>
}

export default TokenChecker
