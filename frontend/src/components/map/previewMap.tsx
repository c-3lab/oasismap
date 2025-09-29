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
import { HappinessKey } from '@/types/happiness-key'
import { useEffect } from 'react'

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
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
        minZoom={5}
      />
      <Marker position={[latitude, longitude]} icon={previewIcon()} />
    </MapContainer>
  )
}
export default PreviewMap
