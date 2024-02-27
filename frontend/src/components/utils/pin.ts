export const COLORS = [
  '#007fff',
  '#00ff00',
  '#7f00ff',
  '#ffff00',
  '#ff7f00',
  '#ff0000',
]

export function GetPin(arr: any[]): any[] {
  return arr
    .filter((data) => data.answers[data.type] !== 0)
    .map((data, index) => ({
      type: data.type,
      latitude: data.location.value.coordinates[0],
      longitude: data.location.value.coordinates[1],
      answer: data.answers[data.type],
      title: `ピン${index + 1}`,
    }))
}
