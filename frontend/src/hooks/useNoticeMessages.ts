import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'

export function useNoticeMessages(initialValue) {
  type Message = {
    uuid: string
    text: string
  }
  const [messages, setMessages] = useState<Message[]>(initialValue)

  function addMessage(text: string) {
    const message: Message = {
      uuid: uuidv4(),
      text: text,
    }

    setMessages([...messages, message])
  }

  function removeMessage(uuid: string) {
    setMessages(messages.filter((message) => message.uuid !== uuid))
  }

  return { messages, addMessage, removeMessage }
}
