import { DateTime } from 'luxon'
import { DateTime as OasismapDateTime } from '@/types/datetime'

export const toDateTime = (value: OasismapDateTime) => {
  const datetime = DateTime.fromFormat(
    `${value.date} ${value.time}`,
    'yyyy-MM-dd HH:mm'
  )
  return datetime
}
