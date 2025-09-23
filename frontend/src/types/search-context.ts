import { PeriodType } from '@/types/period'
import { DateTime as OasismapDateTime } from '@/types/datetime'

export interface DateTimeProps {
  value: OasismapDateTime
  setValue: (value: OasismapDateTime) => void
}

export interface SearchParams {
  startValue?: OasismapDateTime
  endValue?: OasismapDateTime
  searchPeriod?: PeriodType
}

export interface SearchFunction {
  (
    period: PeriodType,
    startProps: DateTimeProps,
    endProps: DateTimeProps
  ): Promise<void>
}

export interface SearchContextType {
  onSearch: SearchFunction | null
  setOnSearch: (searchFn: SearchFunction | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}
