'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  latitude: number
  longitude: number
  icon: L.DivIcon
}

const PreviewMap: React.FC<Props> = ({ latitude, longitude, icon }) => {
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
      <Marker position={[latitude, longitude]} icon={icon} />
    </MapContainer>
  )
}
export default PreviewMap
