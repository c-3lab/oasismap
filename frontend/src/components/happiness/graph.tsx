import { XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart, Bar, LineChart, Legend, Line } from 'recharts'

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
            dataKey="averageQ1"
            stroke={color[0]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="averageQ2"
            stroke={color[1]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="averageQ3"
            stroke={color[2]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="averageQ4"
            stroke={color[3]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="averageQ5"
            stroke={color[4]}
            dot={true}
          />
          <Line
            type="monotone"
            dataKey="averageQ6"
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
