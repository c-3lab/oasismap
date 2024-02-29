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
import { getIconByType } from '../utils/Icon'

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

const questionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export { questionTitles }

const MapOverlay = ({ type, filteredPins }) => (
  <LayersControl.Overlay checked name={questionTitles[type]}>
    <LayerGroup>
      {filteredPins.map((pin, index) => (
        <Marker
          key={index}
          position={[pin.latitude, pin.longitude]}
          icon={getIconByType(pin.type, pin.answer)}
        >
          <Popup>
            <table border={1}>
              {pin.basetime && (
                <thead>
                  <tr>
                    <th>回答日時</th>
                    <th>{pin.timestamp}</th>
                  </tr>
                </thead>
              )}
              <tbody>
                <tr>
                  <th>{questionTitles.happiness1}</th>
                  <th>{pin.answer1}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness2}</th>
                  <th>{pin.answer2}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness3}</th>
                  <th>{pin.answer3}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness4}</th>
                  <th>{pin.answer4}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness5}</th>
                  <th>{pin.answer5}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness6}</th>
                  <th>{pin.answer6}</th>
                </tr>
              </tbody>
            </table>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  </LayersControl.Overlay>
)

const MapSet: React.FC<Props> = ({ pinData }) => {
  const filteredPinsByType = (type) =>
    pinData.filter((pin) => pin.type === type)

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
        {Object.keys(questionTitles).map((type) => (
          <MapOverlay
            key={type}
            type={type}
            filteredPins={filteredPinsByType(type)}
          />
        ))}
      </LayersControl>
      <ClosePopup />
    </MapContainer>
  )
}

export default MapSet
