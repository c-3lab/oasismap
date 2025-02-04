import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { HappinessKey } from '@/types/happiness-key'
import { HAPPINESS_KEYS, questionTitles } from '@/libs/constants'
import { LineChart, Legend, Line } from 'recharts'

const LineGraph = (props: any) => {
  const { title, plotdata, color, xTickFormatter, isLoaded, selectedLayers } = props
  const isEmptyData = !plotdata || plotdata.length === 0

  return (
    <>
      <h3 className="text-white text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        {isLoaded && isEmptyData ? (
          <div
            style={{
              border: '1px solid #a9a9a9',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '250px',
              color: '#a9a9a9',
              fontSize: '16px',
              marginLeft: '20px',
              marginRight: '20px',
            }}
          >
            データがありません
          </div>
        ) : (
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
            {HAPPINESS_KEYS.map((dataKey: HappinessKey, i: number) => {
              if (!selectedLayers.includes(dataKey)) return
              return (
                <Line
                  key={dataKey}
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color[i]}
                  dot={true}
                  name={questionTitles[dataKey]}
                />
              )
            })}
          </LineChart>
        )}
      </ResponsiveContainer>
    </>
  )
}

export default LineGraph
