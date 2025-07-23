import { Pin } from '@/types/pin'
import { Data } from '@/types/happiness-me-response'
import { MapDataItem } from '@/types/happiness-all-response'

function convertTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function GetPin(arr: (Data | MapDataItem)[]): Pin[] {
  console.log('GetPin: Input array length:', arr.length);
  console.log('GetPin: First item:', arr[0]);
  
  const filteredArr = arr.filter((data: MapDataItem) => {
    const shouldInclude = data.answers[data.type] !== 0;
    console.log(`GetPin: Filtering ${data.type}, answer: ${data.answers[data.type]}, include: ${shouldInclude}`);
    return shouldInclude;
  });
  
  console.log('GetPin: Filtered array length:', filteredArr.length);
  
  return filteredArr.map((data) => {
      let basetime
      let timestamp
      let memo
      let memos
      if ('timestamp' in data && data.timestamp) {
        timestamp = convertTimestamp(data.timestamp)
        basetime = data.timestamp
        memo = data.memo
        memos = undefined
      } else {
        basetime = undefined
        timestamp = undefined
        memo = undefined
        memos = data.memos.map(({ timestamp, memo }) => {
          return { timestamp: convertTimestamp(timestamp), memo }
        })
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
        timestamp: timestamp,
      }
      return pin
    })
}
