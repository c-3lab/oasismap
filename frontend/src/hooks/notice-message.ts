import { useCallback, useMemo, useState } from 'react'
import { MessageType } from '@/types/message-type'

export const useNoticeMessage = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<MessageType>(MessageType.Success)

  const showMessage = useCallback((text: string, type: MessageType) => {
    setMessage(text)
    setType(type)
  }, [])

  const clearMessage = useCallback(() => {
    setMessage(null)
  }, [])

  return useMemo(
    () => ({ message, type, showMessage, clearMessage }),
    [message, type, showMessage, clearMessage]
  )
}
