import { useState } from 'react'
import { MessageType } from '@/types/message-type'

export const useNoticeMessage = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<MessageType>(MessageType.Success)

  const showMessage = (text: string, type: MessageType) => {
    setMessage(text)
    setType(type)
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return { message, type, showMessage, clearMessage }
}
