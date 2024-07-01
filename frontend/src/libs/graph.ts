import { DateTime } from 'luxon'
import { MapDataItem } from '@/types/happiness-me-response'
import { happinessObj, happinessSet } from '@/types/happiness-set'

function insertTimestamp(
  objects: happinessObj[],
  start: number,
  end: number
): happinessObj[] {
  for (let t = start; t <= end; t++) {
    const matchingObjects = objects.filter((obj) => Number(obj.timestamp) === t)
    if (matchingObjects.length === 0) {
      objects.push({
        timestamp: String(t).padStart(2, '0'),
        happiness1: 0,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      })
    }
  }
  return objects
}

function filterByTimestamp(objects: happinessObj[]): happinessSet {
  const now = DateTime.local()
  const oneday = now.minus({ day: 1 })
  const onemonth = now.minus({ month: 1 })
  const oneyear = now.minus({ year: 1 })

  const result = {
    day: objects
      .filter(
        (obj) =>
          DateTime.fromISO(obj.timestamp).toFormat('yyyy-MM-dd-HH') >
          onemonth.toFormat('yyyy-MM-dd-HH')
      )
      .map((obj) => ({
        ...obj,
        timestamp: DateTime.fromISO(obj.timestamp).toFormat('dd'),
      })),
    month: objects
      .filter(
        (obj) =>
          DateTime.fromISO(obj.timestamp).toFormat('yyyy-MM-dd-HH') >
          oneyear.toFormat('yyyy-MM-dd-HH')
      )
      .map((obj) => ({
        ...obj,
        timestamp: DateTime.fromISO(obj.timestamp).toFormat('MM'),
      })),
    time: objects
      .filter(
        (obj) =>
          DateTime.fromISO(obj.timestamp).toFormat('yyyy-MM-dd-HH') >
          oneday.toFormat('yyyy-MM-dd-HH')
      )
      .map((obj) => ({
        ...obj,
        timestamp: DateTime.fromISO(obj.timestamp).toFormat('HH'),
      })),
  }
  return result
}

function aveByTimestamp(objects: happinessObj[]): happinessObj[] {
  const result: happinessObj[] = []

  const timeList = new Set(objects.map((item) => item['timestamp']))
  timeList.forEach((time) => {
    const h = [0, 0, 0, 0, 0, 0]
    const matchingObjects = objects.filter((obj) => obj.timestamp === time)
    matchingObjects.forEach((item) => {
      h[0] += item.happiness1
      h[1] += item.happiness2
      h[2] += item.happiness3
      h[3] += item.happiness4
      h[4] += item.happiness5
      h[5] += item.happiness6
    })

    result.push({
      timestamp: matchingObjects[0].timestamp,
      happiness1: Number((h[0] / matchingObjects.length).toFixed(1)),
      happiness2: Number((h[1] / matchingObjects.length).toFixed(1)),
      happiness3: Number((h[2] / matchingObjects.length).toFixed(1)),
      happiness4: Number((h[3] / matchingObjects.length).toFixed(1)),
      happiness5: Number((h[4] / matchingObjects.length).toFixed(1)),
      happiness6: Number((h[5] / matchingObjects.length).toFixed(1)),
    })
  })

  return result
}

export function sumByTimestamp(objects: happinessObj[]): happinessObj[] {
  const result: happinessObj[] = []

  const timeList = new Set(objects.map((item) => item['timestamp']))

  timeList.forEach((time) => {
    const h = [0, 0, 0, 0, 0, 0]
    const matchingObjects = objects.filter((obj) => obj.timestamp === time)
    matchingObjects.forEach((item) => {
      h[0] += item.happiness1
      h[1] += item.happiness2
      h[2] += item.happiness3
      h[3] += item.happiness4
      h[4] += item.happiness5
      h[5] += item.happiness6
    })

    result.push({
      timestamp: matchingObjects[0].timestamp,
      happiness1: h[0],
      happiness2: h[1],
      happiness3: h[2],
      happiness4: h[3],
      happiness5: h[4],
      happiness6: h[5],
    })
  })
  return result
}

function sortByCurrentTime(
  objects: happinessObj[],
  date: number
): happinessObj[] {
  const currentIndex = objects.findIndex(
    (obj) => Number(obj.timestamp) === date
  )
  if (currentIndex !== -1) {
    const currentTimestampObj = objects.splice(currentIndex, 1)[0]
    const rotatedArray = objects
      .slice(currentIndex)
      .concat(objects.slice(0, currentIndex))
    rotatedArray.push(currentTimestampObj)
    return rotatedArray
  }
  return objects
}

export function ourHappinessData(objects: happinessObj[]): happinessSet {
  const now = DateTime.local()
  const filterData = filterByTimestamp(objects)
  const sumData = {
    day: aveByTimestamp(filterData['day']),
    month: aveByTimestamp(filterData['month']),
    time: aveByTimestamp(filterData['time']),
  }

  sumData['month'] = insertTimestamp(sumData['month'], 1, 12).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )
  sumData['day'] = insertTimestamp(sumData['day'], 1, 31).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )
  sumData['time'] = insertTimestamp(sumData['time'], 0, 23).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )
  sumData['month'] = sortByCurrentTime(sumData['month'], now.month)
  sumData['day'] = sortByCurrentTime(sumData['day'], now.day)
  sumData['time'] = sortByCurrentTime(sumData['time'], now.hour)
  return sumData
}

export function myHappinessData(objects: MapDataItem[]): happinessSet {
  const now = DateTime.local()

  const formatObj: happinessObj[] = []
  objects
    .filter((h) => h.type == 'happiness1')
    .forEach((obj) => {
      formatObj.push({
        timestamp: obj.timestamp,
        happiness1: obj.answers['happiness1'],
        happiness2: obj.answers['happiness2'],
        happiness3: obj.answers['happiness3'],
        happiness4: obj.answers['happiness4'],
        happiness5: obj.answers['happiness5'],
        happiness6: obj.answers['happiness6'],
      })
    })

  const filterData = filterByTimestamp(formatObj)
  const sumData = {
    day: sumByTimestamp(filterData['day']),
    month: sumByTimestamp(filterData['month']),
    time: sumByTimestamp(filterData['time']),
  }
  sumData['month'] = insertTimestamp(sumData['month'], 1, 12).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )
  sumData['day'] = insertTimestamp(sumData['day'], 1, 31).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )
  sumData['time'] = insertTimestamp(sumData['time'], 0, 23).sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )

  sumData['month'] = sortByCurrentTime(sumData['month'], now.month)
  sumData['day'] = sortByCurrentTime(sumData['day'], now.day)
  sumData['time'] = sortByCurrentTime(sumData['time'], now.hour)

  return sumData
}
