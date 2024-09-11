import { HappinessKey } from '@/types/happiness-key'

export interface HappinessAllResponse {
  count: number
  map_data: { [key: string]: MapData }
  graph_data: GraphData[]
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
  answers: {
    happiness1: number
    happiness2: number
    happiness3: number
    happiness4: number
    happiness5: number
    happiness6: number
  }
}

interface GraphData {
  count: number
  timestamp: string
  happiness1: number
  happiness2: number
  happiness3: number
  happiness4: number
  happiness5: number
  happiness6: number
}
