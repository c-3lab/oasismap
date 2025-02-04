import { HappinessKey } from './happiness-key'

export interface Pin {
  id: string
  type: HappinessKey
  latitude: number
  longitude: number
  answer: number
  answer1: number
  answer2: number
  answer3: number
  answer4: number
  answer5: number
  answer6: number
  basetime: string | undefined
  timestamp: string | undefined
  memo: string | undefined
  memos: { timestamp: string; memo: string }[] | undefined
}
