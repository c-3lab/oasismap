import { HappinessKey } from '@/types/happiness-key'
import { HappinessFields } from '@/types/happiness-set'

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
  answers: HappinessFields
  memo: string
  memos: { timestamp: string; memo: string }[]
}
