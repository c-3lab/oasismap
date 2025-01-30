import { Pin } from '@/types/pin'
import { Data } from '@/types/happiness-me-response'
import { MapDataItem } from '@/types/happiness-all-response'

export function GetPin(arr: (Data | MapDataItem)[]): Pin[] {
  return arr
    .filter((data: MapDataItem) => data.answers[data.type] !== 0)
    .map((data) => {
      let basetime
      let timestamp
      let memo
      let memos
      let totalmemos
      if ('timestamp' in data && data.timestamp) {
        const date = new Date(data.timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        basetime = data.timestamp
        timestamp = `${year}/${month}/${day} ${hours}:${minutes}`
        memo = data.memo
        memos = undefined
        totalmemos = undefined
      } else {
        basetime = undefined
        timestamp = undefined
        memo = undefined
        memos = data.memos
        totalmemos = data.totalmemos
      }

      const pin: Pin = {
        id: data.id,
        type: data.type,
        latitude: data.location.value.coordinates[0],
        longitude: data.location.value.coordinates[1],
        answer: data.answers[data.type],
        answer1: data.answers['happiness1'],
        answer2: data.answers['happiness2'],
        answer3: data.answers['happiness3'],
        answer4: data.answers['happiness4'],
        answer5: data.answers['happiness5'],
        answer6: data.answers['happiness6'],
        basetime: basetime,
        memo: memo,
        memos: memos,
        totalmemos: totalmemos,
        timestamp: timestamp,
      }
      return pin
    })
}
