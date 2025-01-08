import { HappinessKey } from '@/types/happiness-key'

export interface Data {
  id: string
  entityId: string
  type: HappinessKey
  location: {
    type: string
    value: {
      type: string
      coordinates: [number, number]
    }
  }
  timestamp: string
  answers: {
    happiness1: number
    happiness2: number
    happiness3: number
    happiness4: number
    happiness5: number
    happiness6: number
  }
  memo: string
}
