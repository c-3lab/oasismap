export const COLORS = [
  '#2A81CB',
  '#2AAD27',
  '#9C2BCB',
  '#FFD326',
  '#CB8427',
  '#CB2B3E',
]

export function GetPin(arr: any[]): any[] {
  return arr
    .filter((data) => data.answers[data.type] !== 0)
    .map((data) => ({
      type: data.type,
      latitude: data.location.value.coordinates[0],
      longitude: data.location.value.coordinates[1],
      title: `回答時間: ${new Date(data.timestamp).toLocaleString('ja-JP')}\n幸福度1: ${data.answers['happiness1']}\n幸福度2: ${data.answers['happiness2']}\n幸福度3: ${data.answers['happiness3']}\n幸福度4: ${data.answers['happiness4']}\n幸福度5: ${data.answers['happiness5']}\n幸福度6: ${data.answers['happiness6']}`,
    }))
}
