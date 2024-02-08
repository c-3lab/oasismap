import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  Popup,
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React from 'react'
import 'leaflet/dist/leaflet.css'
import DisplayPoints from './DisplayPoints'
//import DisplaySurfaces from './DisplaySurfaces';
import L from 'leaflet'

const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

const blueIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

const yellowIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

const orangeIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

const violetIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
})

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

//const Map: React.FC<Props> = ({ pointEntities, surfaceEntities, fiware, pinData }) => {
const Map: React.FC<Props> = ({ pointEntities, fiware, pinData }) => {
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
      {pointEntities.map((data, index) => (
        <DisplayPoints key={index} data={data} fiware={fiware} />
      ))}
      {/*
      {surfaceEntities.map((data, index) => (
         <DisplaySurfaces key={index} data={data} fiware={fiware} />
      ))}
      */}
      {pinData.map((pin, index) => (
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
      <ClosePopup />
    </MapContainer>
  )
}

export default Map
