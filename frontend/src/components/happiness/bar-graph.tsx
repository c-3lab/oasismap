import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { BarChart, Bar, Legend } from 'recharts'
import { questionTitles } from '../map/map'

const BarGraph = (props: any) => {
  const { title, plotdata, color, xTickFormatter, highlight, activeMonthDayHour, setActiveMonthDayHour } = props

  const handleClick = (data: any) => {
    if (activeMonthDayHour === Number(data.timestamp)) {
      setActiveMonthDayHour(null)
      return
    }
    setActiveMonthDayHour(Number(data.timestamp))
  }

  return (
    <>
      <h3 className="text-white text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={730}
          height={250}
          data={plotdata}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          style={{ backgroundColor: '#ffffff' }}
        >
          <CartesianGrid stroke="#a9a9a9" />
          <XAxis dataKey="timestamp" tick={xTickFormatter} interval={0} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Bar
            dataKey="happiness1"
            stackId={1}
            fill={color[0]}
            name={questionTitles.happiness1}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[0]}
              />
            ))}
          </Bar>
          <Bar
            dataKey="happiness2"
            stackId={1}
            fill={color[1]}
            name={questionTitles.happiness2}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[1]}
              />
            ))}
          </Bar>
          <Bar
            dataKey="happiness3"
            stackId={1}
            fill={color[2]}
            name={questionTitles.happiness3}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[2]}
              />
            ))}
          </Bar>
          <Bar
            dataKey="happiness4"
            stackId={1}
            fill={color[3]}
            name={questionTitles.happiness4}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[3]}
              />
            ))}
          </Bar>
          <Bar
            dataKey="happiness5"
            stackId={1}
            fill={color[4]}
            name={questionTitles.happiness5}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[4]}
              />
            ))}
          </Bar>
          <Bar
            dataKey="happiness6"
            stackId={1}
            fill={color[5]}
            name={questionTitles.happiness6}
            onClick={handleClick}
          >
            {plotdata !== undefined && plotdata.map((data: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                stroke={Number(data.timestamp) === highlight ? 'black' : 'none'}
                strokeWidth={Number(data.timestamp) === highlight ? 2 : 0}
                fill={(activeMonthDayHour && Number(data.timestamp) !== activeMonthDayHour) ? 'grey' : color[5]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default BarGraph
