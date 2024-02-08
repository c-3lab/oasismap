export const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  'red',
  'pink',
]

export function GetPin(arr: any[]): any[] {
  return arr
    .filter((data) => data.answers[data.type] !== 0)
    .map((data, index) => ({
      type: data.type,
      latitude: data.location.value.coordinates[0],
      longitude: data.location.value.coordinates[1],
      title: `ピン${index + 1}`,
    }))
}
