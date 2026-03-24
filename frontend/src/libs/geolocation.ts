import {
  setGeolocationStatus,
  reportPositionError,
  positionErrorCodeToStatus,
} from './client-error-reporting'

export const getCurrentPosition = async () => {
  // 環境変数の取得に失敗した場合は日本経緯度原点を設定
  const defaultLatitude =
    parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE!) || 35.6581064
  const defaultLongitude =
    parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE!) || 139.7413637

  // geolocation が http に対応していないため固定値を返却
  if (location.protocol === 'http:') {
    setGeolocationStatus('not_supported')
    return {
      latitude: defaultLatitude,
      longitude: defaultLongitude,
    }
  }
  if (!navigator.geolocation) {
    setGeolocationStatus('not_supported')
    return {
      latitude: defaultLatitude,
      longitude: defaultLongitude,
    }
  }
  try {
    const position: GeolocationPosition = await new Promise(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGeolocationStatus('available')
            resolve(pos)
          },
          (err: GeolocationPositionError) => {
            setGeolocationStatus(positionErrorCodeToStatus(err.code))
            reportPositionError(err.code)
            reject(err)
          },
          { enableHighAccuracy: true }
        )
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
