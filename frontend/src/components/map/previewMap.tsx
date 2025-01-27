'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet'
import { getIconByType } from '@/components/utils/icon'
import { HappinessKey } from '@/types/happiness-key'

type Props = {
  latitude: number
  longitude: number
  answer: { [key in HappinessKey]: number }
}

const PreviewMap: React.FC<Props> = ({ latitude, longitude, answer }) => {
  const previewIcon = () => {
    for (const [key, value] of Object.entries(answer)) {
      if (value === 1) {
        return getIconByType('pin', key, value)
      }
    }
    return getIconByType('pin', 'happiness1', 1)
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={18}
      zoomControl={false}
      scrollWheelZoom={false} // スクロールによるズーム無効化
      dragging={false} // ドラッグ無効化
    >
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
