'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, ZoomControl } from 'react-leaflet'
import { getIconByType } from '@/components/utils/icon'
import { HappinessKey } from '@/types/happiness-key'
import GSIVectorLayer from './GSIVectorLayer'

type Props = {
  latitude: number
  longitude: number
  answer: { [key in HappinessKey]: number }
}

const PreviewMap: React.FC<Props> = ({ latitude, longitude, answer }) => {
  const previewIcon = () => {
    for (const [key, value] of Object.entries(answer) as [
      HappinessKey,
      number,
    ][]) {
      if (value === 1) {
        return getIconByType('pin', key, value, true)
      }
    }
    return getIconByType('pin', 'happiness1', 1, true)
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={18}
      zoomControl={false}
      scrollWheelZoom={true} // スクロールによるズーム有効化
      dragging={true} // ドラッグ有効化
    >
      <ZoomControl position={'bottomleft'} />
      <GSIVectorLayer />
      <Marker position={[latitude, longitude]} icon={previewIcon()} />
    </MapContainer>
  )
}
export default PreviewMap
