import { HappinessKey } from '@/types/happiness-key'
import { HappinessFields } from '@/types/happiness-set'

export interface HappinessAllResponse {
  count: number
  map_data: { [key: string]: MapData }
}

export interface MapData {
  count: number
  data: MapDataItem[]
}

export interface MapDataItem {
  id: string
  type: HappinessKey
  location: {
    type: string
    value: {
      type: string
      coordinates: [number, number]
    }
  }
  answers: HappinessFields
  memos: { timestamp: string; memo: string }[]
}
