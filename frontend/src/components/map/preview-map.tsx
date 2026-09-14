'use client'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import { getIconByType } from '@/components/utils/icon'
import { handleTileError } from '@/components/utils/tile-fallback-log'
import { HappinessKey } from '@/types/happiness-key'
import { useEffect, useState } from 'react'

type Props = {
  latitude: number
  longitude: number
  answer: { [key in HappinessKey]: number }
}

// Component to update map view when coordinates change
const MapUpdater: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const map = useMap()

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom())
  }, [latitude, longitude, map])

  return null
}

const PreviewMap: React.FC<Props> = ({ latitude, longitude, answer }) => {
  const [useFallback, setUseFallback] = useState(false)
  const previewIcon = () => {
    for (const [key, value] of Object.entries(answer) as [
      HappinessKey,
      number,
    ][]) {
      if (value === 1) {
        return getIconByType(key)
      }
    }
    return getIconByType('happiness1')
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={18}
      zoomControl={false}
      scrollWheelZoom={true} // スクロールによるズーム有効化
      dragging={true} // ドラッグ有効化
    >
      <MapUpdater latitude={latitude} longitude={longitude} />
      <ZoomControl position={'bottomleft'} />
      {!useFallback && (
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={5}
          eventHandlers={{
            tileerror: () => handleTileError(setUseFallback),
          }}
        />
      )}
      {useFallback && (
        <TileLayer
          attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={5}
        />
      )}
      <Marker position={[latitude, longitude]} icon={previewIcon()} />
    </MapContainer>
  )
}
export default PreviewMap
