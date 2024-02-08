export function GetPin(arr: any[]): any[] {
  return arr.map((data, index) => ({
    type: data.type,
    latitude: data.latitude,
    longitude: data.longitude,
    title: `ピン${index + 1}`,
  }))
}
