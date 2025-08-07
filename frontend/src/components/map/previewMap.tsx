'use client'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  LayersControl,
} from 'react-leaflet'
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
      <LayersControl position="topleft">
        <LayersControl.BaseLayer checked name="GSI Vector Tiles">
          <GSIVectorLayer />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="標準地図">
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            minZoom={5}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="淡色地図">
          <TileLayer
            attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">出典：地理院タイル</a>'
            url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
            maxZoom={18}
            minZoom={5}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <Marker position={[latitude, longitude]} icon={previewIcon()} />
    </MapContainer>
  )
}
export default PreviewMap
