import { XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart, Bar, LineChart, Legend, Line } from 'recharts'
import { DateTime } from 'luxon'

interface happinessObj {
  timestamp: number
  happiness1: number
  happiness2: number
  happiness3: number
  happiness4: number
  happiness5: number
  happiness6: number
}

interface happinessSet {
  month: happinessObj[]
  day: happinessObj[]
  time: happinessObj[]
}

interface dataSet {
  month: dataObj[]
  day: dataObj[]
  time: dataObj[]
}

interface dataObj {
  id: string
  type: string
  timestamp: string
  location: {
    type: string
    value: {
      type: string
      coordinates: number[]
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

function insertTimestamp(
  objects: happinessObj[],
  start: number,
  end: number
): happinessObj[] {
  for (let t = start; t <= end; t++) {
    const matchingObjects = objects.filter((obj) => Number(obj.timestamp) === t)
    if (matchingObjects.length === 0) {
      objects.push({
        timestamp: t,
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

function filterByTimestamp(objects: dataObj[]): dataSet {
  const now = DateTime.local()
  const oneday = now.minus({ day: 1 })
  const onemonth = now.minus({ month: 1 })
  const oneyear = now.minus({ year: 1 })

  //重複する幸福度を除去
  const filteredObj = objects.filter((h) => h.type == 'happiness1')

  //古い幸福度を除去
  const result = {
    day: filteredObj
      .filter(
        (obj) =>
          DateTime.fromISO(obj.timestamp).toFormat('yyyy-MM-dd-HH') >
          onemonth.toFormat('yyyy-MM-dd-HH')
      )
      .map((obj) => ({
        ...obj,
        timestamp: DateTime.fromISO(obj.timestamp).toFormat('dd'),
      })),
    month: filteredObj
      .filter(
        (obj) =>
          DateTime.fromISO(obj.timestamp).toFormat('yyyy-MM-dd-HH') >
          oneyear.toFormat('yyyy-MM-dd-HH')
      )
      .map((obj) => ({
        ...obj,
        timestamp: DateTime.fromISO(obj.timestamp).toFormat('MM'),
      })),
    time: filteredObj
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

function aveByTimestamp(objects: dataObj[]): happinessObj[] {
  const result: happinessObj[] = []

  const timeList = new Set(objects.map((item) => item['timestamp']))
  timeList.forEach((time) => {
    const h = [0, 0, 0, 0, 0, 0]
    const matchingObjects = objects.filter((obj) => obj.timestamp === time)
    matchingObjects.forEach((item) => {
      h[0] += item.answers['happiness1']
      h[1] += item.answers['happiness2']
      h[2] += item.answers['happiness3']
      h[3] += item.answers['happiness4']
      h[4] += item.answers['happiness5']
      h[5] += item.answers['happiness6']
    })

    result.push({
      timestamp: Number(matchingObjects[0].timestamp),
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
//日付が同じ場合は合算
function sumByTimestamp(objects: dataObj[]): happinessObj[] {
  const result: happinessObj[] = []

  const timeList = new Set(objects.map((item) => item['timestamp']))

  timeList.forEach((time) => {
    const h = [0, 0, 0, 0, 0, 0]
    const matchingObjects = objects.filter((obj) => obj.timestamp === time)
    matchingObjects.forEach((item) => {
      h[0] += item.answers['happiness1']
      h[1] += item.answers['happiness2']
      h[2] += item.answers['happiness3']
      h[3] += item.answers['happiness4']
      h[4] += item.answers['happiness5']
      h[5] += item.answers['happiness6']
    })

    result.push({
      timestamp: Number(matchingObjects[0].timestamp),
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
    objects.unshift(
      ...objects.splice(currentIndex, objects.length - currentIndex)
    )
  }
  return objects
}

export function ourHappinessData(objects: dataObj[]): happinessSet {
  const now = DateTime.local()
  const filterData = filterByTimestamp(objects)
  const sumData = {
    day: aveByTimestamp(filterData['day']),
    month: aveByTimestamp(filterData['month']),
    time: aveByTimestamp(filterData['time']),
  }

  sumData['month'] = insertTimestamp(sumData['month'], 1, 12).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  sumData['day'] = insertTimestamp(sumData['day'], 1, 31).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  sumData['time'] = insertTimestamp(sumData['time'], 0, 23).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  sumData['month'] = sortByCurrentTime(sumData['month'], now.month)
  sumData['day'] = sortByCurrentTime(sumData['day'], now.day)
  sumData['time'] = sortByCurrentTime(sumData['time'], now.hour)
  return sumData
}

export function myHappinessData(objects: dataObj[]): happinessSet {
  const now = DateTime.local()
  const filterData = filterByTimestamp(objects)
  const sumData = {
    day: sumByTimestamp(filterData['day']),
    month: sumByTimestamp(filterData['month']),
    time: sumByTimestamp(filterData['time']),
  }
  sumData['month'] = insertTimestamp(sumData['month'], 1, 12).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  sumData['day'] = insertTimestamp(sumData['day'], 1, 31).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  sumData['time'] = insertTimestamp(sumData['time'], 0, 23).sort(
    (a, b) => a.timestamp - b.timestamp
  )

  sumData['month'] = sortByCurrentTime(sumData['month'], now.month)
  sumData['day'] = sortByCurrentTime(sumData['day'], now.day)
  sumData['time'] = sortByCurrentTime(sumData['time'], now.hour)

  return sumData
}

export const LineGraph = (props: any) => {
  const { title, plotdata, color, xTickFormatter } = props

  return (
    <>
      <h3 className="text-white text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={730}
          height={250}
          data={plotdata}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <XAxis dataKey="timestamp" tick={xTickFormatter} interval={0} />
          <YAxis
            tickCount={11}
            domain={[0, 1]}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
          />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Line
            type="monotone"
            dataKey="happiness1"
            stroke={color[0]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="happiness2"
            stroke={color[1]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="happiness3"
            stroke={color[2]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="happiness4"
            stroke={color[3]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="happiness5"
            stroke={color[4]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="happiness6"
            stroke={color[5]}
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

export const BarGraph = (props: any) => {
  const { title, plotdata, color, xTickFormatter } = props

  return (
    <>
      <h3 className="text-white text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={730}
          height={250}
          data={plotdata}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <XAxis dataKey="timestamp" tick={xTickFormatter} interval={0} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Bar dataKey="happiness1" stackId={1} fill={color[0]} />
          <Bar dataKey="happiness2" stackId={1} fill={color[1]} />
          <Bar dataKey="happiness3" stackId={1} fill={color[2]} />
          <Bar dataKey="happiness4" stackId={1} fill={color[3]} />
          <Bar dataKey="happiness5" stackId={1} fill={color[4]} />
          <Bar dataKey="happiness6" stackId={1} fill={color[5]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
