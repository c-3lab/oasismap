const DEFAULT_LATITUDE = 35.6581064
const DEFAULT_LONGITUDE = 139.7413637

export type GetCurrentPositionOptions = {
  defaultLatitude?: number
  defaultLongitude?: number
}

export const getCurrentPosition = async (
  options?: GetCurrentPositionOptions
): Promise<{ latitude?: number; longitude?: number }> => {
  const defaultLatitude = options?.defaultLatitude ?? DEFAULT_LATITUDE
  const defaultLongitude = options?.defaultLongitude ?? DEFAULT_LONGITUDE

  // geolocation が http に対応していないため固定値を返却
  if (location.protocol === 'http:') {
    return {
      latitude: defaultLatitude,
      longitude: defaultLongitude,
    }
  }
  try {
    const position: GeolocationPosition = await new Promise(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        })
      }
    )
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }
  } catch (error) {
    console.error('Error Get Current Position:', error)
    return {
      latitude: undefined,
      longitude: undefined,
    }
  }
}
