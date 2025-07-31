import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { BarChart, Bar, Legend } from 'recharts'
import { questionTitles } from '@/libs/constants'
import { HappinessKey } from '@/types/happiness-key'
import { HAPPINESS_KEYS } from '@/libs/constants'
import { happinessObj } from '@/types/happiness-set'

const BarGraph = (props: any) => {
  const {
    title,
    plotdata,
    color,
    xTickFormatter,
    highlightTarget,
    setHighlightTarget,
    isLoaded,
  } = props
  const isEmptyData = !plotdata || plotdata.length === 0

  const handleClick = (data: unknown) => {
    if (
      typeof data !== 'object' ||
      data === null ||
      'payload' in data === false
    )
      return
    const clickedHappinesObj = data.payload
    if (
      typeof clickedHappinesObj !== 'object' ||
      clickedHappinesObj === null ||
      'timestamp' in clickedHappinesObj === false
    )
      return
    const barXAxisValue = Number(clickedHappinesObj.timestamp)

    if (highlightTarget.xAxisValue === barXAxisValue) {
      setHighlightTarget({ lastUpdateBy: 'Graph', xAxisValue: null })
    } else {
      setHighlightTarget({ lastUpdateBy: 'Graph', xAxisValue: barXAxisValue })
    }
  }

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
            {HAPPINESS_KEYS.map(
              (dataKey: HappinessKey, happinessIndex: number) => {
                return (
                  <Bar
                    key={dataKey}
                    dataKey={dataKey}
                    stackId={1}
                    fill={color[happinessIndex]}
                    name={questionTitles[dataKey]}
                    onClick={handleClick}
                  >
                    {plotdata !== undefined &&
                      plotdata.map(
                        (data: happinessObj, plotdataIndex: number) => (
                          <Cell
                            key={`cell-${plotdataIndex}`}
                            fill={
                              // xAxisValueがnullの場合、全体のハイライトは解除されているのでカラーで表示
                              !highlightTarget.xAxisValue ||
                              Number(data.timestamp) ===
                                highlightTarget.xAxisValue
                                ? color[happinessIndex]
                                : 'grey'
                            }
                          />
                        )
                      )}
                  </Bar>
                )
              }
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </>
  )
}

export default BarGraph
