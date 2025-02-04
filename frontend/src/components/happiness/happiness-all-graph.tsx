import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'
import {
  HAPPINESS_ALL_BAR_GRAPH_YAXIS_WIDTH,
  questionTitles,
} from '@/libs/constants'
import { graphColors } from '@/theme/color'
import { Pin } from '@/types/pin'

export const HappinessAllGraph = ({ data }: { data: Pin }) => {
  const barChartData: { questionTitle: string; value: number }[] = [
    {
      questionTitle: questionTitles.happiness1,
      value: Math.ceil(data.answer1 * 100),
    },
    {
      questionTitle: questionTitles.happiness2,
      value: Math.ceil(data.answer2 * 100),
    },
    {
      questionTitle: questionTitles.happiness3,
      value: Math.ceil(data.answer3 * 100),
    },
    {
      questionTitle: questionTitles.happiness4,
      value: Math.ceil(data.answer4 * 100),
    },
    {
      questionTitle: questionTitles.happiness5,
      value: Math.ceil(data.answer5 * 100),
    },
    {
      questionTitle: questionTitles.happiness6,
      value: Math.ceil(data.answer6 * 100),
    },
  ]

  return (
    <BarChart
      data={barChartData}
      layout="vertical"
      barCategoryGap={1}
      margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
      width={325}
      height={200}
    >
      <CartesianGrid horizontal={false} />
      <XAxis type="number" domain={[0, 100]} ticks={[0, 50, 100]} />
      <YAxis
        type="category"
        width={HAPPINESS_ALL_BAR_GRAPH_YAXIS_WIDTH}
        axisLine={true}
        tickLine={false}
        dataKey="questionTitle"
        interval={0}
        tick={({ x, y, payload, index }) => {
          return (
            <text
              x={x - 55}
              y={y + 5}
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
          <text x={x + 10} y={y + 17.5} fill="black" fontSize={12}>
            {barChartData[index].value}%
          </text>
        )}
        barSize={30}
        shape={(props: unknown) => {
          if (typeof props !== 'object' || props === null) return <></>
          if (
            'index' in props &&
            'y' in props &&
            'width' in props &&
            'height' in props
          ) {
            if (typeof props.index !== 'number') return <></>
            if (typeof props.y !== 'number') return <></>
            if (typeof props.width !== 'number') return <></>
            if (typeof props.height !== 'number') return <></>
          } else return <></>

          const { y, width, height, index } = props
          return (
            <rect
              y={y}
              width={width}
              height={height}
              // 棒グラフ開始位置の調整部分
              x={HAPPINESS_ALL_BAR_GRAPH_YAXIS_WIDTH}
              fill={graphColors[index]}
              fillOpacity={0.5}
            />
          )
        }}
      />
    </BarChart>
  )
}
