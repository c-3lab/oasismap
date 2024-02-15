import { useState } from 'react'

export const useNoticeMessage = () => {
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (text: string) => {
    setMessage(text)
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return { message, showMessage, clearMessage }
}
