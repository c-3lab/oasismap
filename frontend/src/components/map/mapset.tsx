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
    case 'happiness1':
      return blueIcon
    case 'happiness2':
      return greenIcon
    case 'happiness3':
      return violetIcon
    case 'happiness4':
      return yellowIcon
    case 'happiness5':
      return orangeIcon
    case 'happiness6':
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
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

const MapSet: React.FC<Props> = ({ pinData }) => {
  const h1 = pinData.filter((pin) => pin.type === 'happiness1')
  const h2 = pinData.filter((pin) => pin.type === 'happiness2')
  const h3 = pinData.filter((pin) => pin.type === 'happiness3')
  const h4 = pinData.filter((pin) => pin.type === 'happiness4')
  const h5 = pinData.filter((pin) => pin.type === 'happiness5')
  const h6 = pinData.filter((pin) => pin.type === 'happiness6')

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
        <LayersControl.Overlay checked name={questionTitle['happiness1']}>
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

        <LayersControl.Overlay checked name={questionTitle['happiness2']}>
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

        <LayersControl.Overlay checked name={questionTitle['happiness3']}>
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

        <LayersControl.Overlay checked name={questionTitle['happiness4']}>
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

        <LayersControl.Overlay checked name={questionTitle['happiness5']}>
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

        <LayersControl.Overlay checked name={questionTitle['happiness6']}>
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
