import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React from 'react'
import 'leaflet/dist/leaflet.css'
import {
  redIcon,
  blueIcon,
  greenIcon,
  yellowIcon,
  orangeIcon,
  violetIcon,
} from '../utils/marker'
const getIconByType = (type: string) => {
  switch (type) {
    case 'hapiness1':
      return blueIcon
    case 'hapiness2':
      return greenIcon
    case 'hapiness3':
      return violetIcon
    case 'hapiness4':
      return yellowIcon
    case 'hapiness5':
      return orangeIcon
    case 'hapiness6':
      return redIcon
    default:
      return redIcon
  }
}

const loadEnvAsNumber = (
  variable: string | undefined,
  defaultValue: number
): number => {
  if (!variable) return defaultValue
  const value = parseFloat(variable)
  if (Number.isNaN(value)) return defaultValue
  return value
}

const defaultLatitude = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE),
  35.6581107
)
const defaultLongitude = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE),
  139.7387888
)
const defaultZoom = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM),
  13
)

const defaultPosition: LatLngTuple = [defaultLatitude, defaultLongitude]

type Props = {
  pointEntities: any[]
  surfaceEntities: any[]
  fiware: {
    tenant: string
    servicePath: string
  }
  pinData: any[]
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
  return null
}

const questionTitle = {
  hapiness1: 'ワクワクする場所',
  hapiness2: '発見の学びの場所',
  hapiness3: 'ホッとする場所',
  hapiness4: '自分を取り戻せる場所',
  hapiness5: '自慢の場所',
  hapiness6: '思い出の場所',
}

const MapSet: React.FC<Props> = ({ pinData }) => {
  const h1 = pinData.filter((pin) => pin.type === 'hapiness1')
  const h2 = pinData.filter((pin) => pin.type === 'hapiness2')
  const h3 = pinData.filter((pin) => pin.type === 'hapiness3')
  const h4 = pinData.filter((pin) => pin.type === 'hapiness4')
  const h5 = pinData.filter((pin) => pin.type === 'hapiness5')
  const h6 = pinData.filter((pin) => pin.type === 'hapiness6')

  return (
    <MapContainer
      center={defaultPosition}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <ZoomControl position={'bottomleft'} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topright">
        <LayersControl.Overlay checked name={questionTitle['hapiness1']}>
          <LayerGroup>
            {h1.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitle['hapiness2']}>
          <LayerGroup>
            {h2.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitle['hapiness3']}>
          <LayerGroup>
            {h3.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitle['hapiness4']}>
          <LayerGroup>
            {h4.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitle['hapiness5']}>
          <LayerGroup>
            {h5.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitle['hapiness6']}>
          <LayerGroup>
            {h6.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type)}
              >
                <Popup>
                  <p>{pin.title}</p>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>

      <ClosePopup />
    </MapContainer>
  )
}

export default MapSet
