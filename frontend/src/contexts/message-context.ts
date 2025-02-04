import { createContext } from 'react'
import { MessageType } from '@/types/message-type'

export type MessagesContextType = {
  message: string | null
  type: MessageType
  showMessage: (text: string, type: MessageType) => void
  clearMessage: () => void
}

export const messageContext = createContext<MessagesContextType>({
  message: null,
  type: MessageType.Success,
  showMessage: () => {},
  clearMessage: () => {},
})
