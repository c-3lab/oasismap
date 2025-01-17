import { BarChart, XAxis, YAxis, Bar } from 'recharts'
import { Popup } from 'react-leaflet'
import { questionTitles } from '@/libs/constants'
import { graphColors } from '@/theme/color'
import { Pin } from '@/types/pin'

export const AllPopup = ({ pin }: { pin: Pin }) => {
  const graphData = [
    { questionTitle: questionTitles.happiness1, value: pin.answer1 * 100 },
    { questionTitle: questionTitles.happiness2, value: pin.answer2 * 100 },
    { questionTitle: questionTitles.happiness3, value: pin.answer3 * 100 },
    { questionTitle: questionTitles.happiness4, value: pin.answer4 * 100 },
    { questionTitle: questionTitles.happiness5, value: pin.answer5 * 100 },
    { questionTitle: questionTitles.happiness6, value: pin.answer6 * 100 },
  ]
  return (
    <Popup>
      <BarChart
        data={graphData}
        layout="vertical"
        barCategoryGap={1}
        margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
        width={300}
        height={200}
      >
        <XAxis type="number" domain={[0, 100]} ticks={[0, 50, 100]} />
        <YAxis
          type="category"
          width={125}
          axisLine={true}
          tickLine={false}
          dataKey="questionTitle"
          interval={0}
          tick={({ x, y, payload, index }) => {
            return (
              <text
                x={x - 55}
                y={y}
                fill={graphColors[index]}
                fontSize={12}
                textAnchor="middle"
              >
                {payload.value}
              </text>
            )
          }}
        />
        <Bar
          dataKey="value"
          label={({ x, y, index }) => (
            // グラフ内のパーセンテージのデザイン調整部分
            <text x={x} y={y + 19} fill="black" fontSize={12}>
              {graphData[index].value}%
            </text>
          )}
          barSize={30}
          shape={(props: unknown) => {
            if (
              typeof props === 'object' &&
              props !== null &&
              'index' in props
            ) {
              if (typeof props.index === 'number') {
                ;<></>
              } else {
                return <></>
              }
            } else {
              return <></>
            }
            return (
              <rect
                {...props}
                // 棒グラフ開始位置の調整部分
                x={125}
                fill={graphColors[props.index]}
                fillOpacity={0.5}
              />
            )
          }}
        />
      </BarChart>
    </Popup>
  )
}
