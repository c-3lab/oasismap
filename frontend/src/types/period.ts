import { PERIOD_TYPE } from '@/consts/period'

export type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE]
