import { DateTime } from 'luxon'
import { DateTime as OasismapDateTime } from '@/types/datetime'

export const current = (): OasismapDateTime => {
  const datetime = DateTime.local()
  return {
    date: datetime.toFormat('yyyy-MM-dd'),
    time: datetime.toFormat('HH:mm'),
  }
}

export const previous = (): OasismapDateTime => {
  const datetime = DateTime.local().minus({
    days: 1,
  })
  return {
    date: datetime.toFormat('yyyy-MM-dd'),
    time: datetime.toFormat('HH:mm'),
  }
}

export const toISO8601 = (value: OasismapDateTime) => {
  const datetime = DateTime.fromISO(`${value.date}T${value.time}`)
    .setZone('Asia/Tokyo')
    .toISO()
  return datetime ? datetime : ''
}
