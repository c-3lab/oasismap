import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { LineChart, Legend, Line } from 'recharts'
import { questionTitles } from '../map/map'

const LineGraph = (props: any) => {
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
          style={{ backgroundColor: '#ffffff' }}
        >
          <CartesianGrid stroke="#a9a9a9" />
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
            name={questionTitles.happiness1}
          />
          <Line
            type="monotone"
            dataKey="happiness2"
            stroke={color[1]}
            dot={true}
            name={questionTitles.happiness2}
          />
          <Line
            type="monotone"
            dataKey="happiness3"
            stroke={color[2]}
            dot={true}
            name={questionTitles.happiness3}
          />
          <Line
            type="monotone"
            dataKey="happiness4"
            stroke={color[3]}
            dot={true}
            name={questionTitles.happiness4}
          />
          <Line
            type="monotone"
            dataKey="happiness5"
            stroke={color[4]}
            dot={true}
            name={questionTitles.happiness5}
          />
          <Line
            type="monotone"
            dataKey="happiness6"
            stroke={color[5]}
            dot={true}
            name={questionTitles.happiness6}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

export default LineGraph
