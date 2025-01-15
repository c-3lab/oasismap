import { questionTitles } from '@/libs/constants'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'
import { graphColors } from '@/theme/color'
import { Popup } from 'react-leaflet'
import { Pin } from '@/types/pin'

export const AllPopup = ({ pin }: { pin: Pin }) => {
  const transformData2 = [
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
        data={transformData2}
        layout="vertical"
        barCategoryGap={1}
        margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
        width={300}
        height={200}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          width={70}
          axisLine={false}
          tickLine={false}
          dataKey="questionTitle"
          tick={({ x, y, payload, index }) => {
            const colors = graphColors
            const color = colors[index % colors.length]
            return (
              <text x={x} y={y} fill={color} fontSize={12} textAnchor="middle">
                {payload.value}
              </text>
            )
          }}
        />
        <Bar
          dataKey="value"
          label={({ x, y, index }) => (
            <text x={x + 57} y={y + 19} fill="black" fontSize={12}>
              {transformData2[index].value}%
            </text>
          )}
          barSize={30}
          shape={(props: any) => {
            const { index } = props
            const offset = 125
            const colors = graphColors
            return (
              <rect
                {...props}
                x={offset}
                fill={colors[index % colors.length]}
                fillOpacity={0.5}
              />
            )
          }}
        />
      </BarChart>
    </Popup>
  )
}
