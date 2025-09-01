import { HappinessKey } from '@/types/happiness-key'

export type HappinessFields = {
  [key in HappinessKey]: number
}

export type happinessObj = {
  timestamp: string
} & HappinessFields
