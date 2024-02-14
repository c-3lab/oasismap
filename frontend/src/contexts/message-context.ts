import { createContext } from 'react'

type MessagesContextType = {
  message: string | null
  showMessage: (text: string) => void
  clearMessage: () => void
}

export const messageContext = createContext<MessagesContextType>({
  message: null,
  showMessage: () => {},
  clearMessage: () => {},
})
