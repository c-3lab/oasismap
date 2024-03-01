import { DateTime } from '@/types/datetime'

const createDateTime = (date: Date): DateTime => {
  const year = date.getFullYear().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}-${minutes}`,
  }
}

export const current = (): DateTime => {
  return createDateTime(new Date())
}

export const toISO8601 = (value: DateTime) => {
  const datetime = new Date(`${value.date} ${value.time}`)

  const year = datetime.getFullYear().toString().padStart(2, '0')
  const month = (datetime.getMonth() + 1).toString().padStart(2, '0')
  const day = datetime.getDate().toString().padStart(2, '0')
  const hours = datetime.getHours().toString().padStart(2, '0')
  const minutes = datetime.getMinutes().toString().padStart(2, '0')
  const seconds = datetime.getSeconds().toString().padStart(2, '0')

  const timeZoneOffset = datetime.getTimezoneOffset() / 60
  const timeZone = (() => {
    // 絶対値を取得
    const offsetAbs = Math.abs(timeZoneOffset)
    // 差がマイナスの場合
    if (timeZoneOffset < 0) {
      return `+${offsetAbs.toString().padStart(2, '0')}:00`
    } else {
      return `-${offsetAbs.toString().padStart(2, '0')}:00`
    }
  })()

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timeZone}`
}
