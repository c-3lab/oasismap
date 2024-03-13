import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/Icon'
import { getCurrentPosition } from '../../libs/geolocation'

const loadEnvAsNumber = (
  variable: string | undefined,
  defaultValue: number
): number => {
  if (!variable) return defaultValue
  const value = parseFloat(variable)
  if (Number.isNaN(value)) return defaultValue
  return value
}

const defaultZoom = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM),
  13
)

type Props = {
  pointEntities: any[]
  surfaceEntities: any[]
  fiware: {
    tenant: string
    servicePath: string
  }
  pinData: any[]
  setZoomLevel?: Dispatch<SetStateAction<number>>
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
  return null
}

const ZoomLevel: React.FC<{
  setZoomLevel?: Dispatch<SetStateAction<number>>
}> = ({ setZoomLevel }) => {
  const map = useMapEvents({
    zoomend: () => {
      if (!setZoomLevel) return
      setZoomLevel(map.getZoom())
    },
  })
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

const MapSet: React.FC<Props> = ({ pinData, setZoomLevel }) => {
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const positionResult = await getCurrentPosition()

        if (
          positionResult &&
          positionResult.latitude !== undefined &&
          positionResult.longitude !== undefined
        ) {
          const newPosition: LatLngTuple = [
            positionResult.latitude,
            positionResult.longitude,
          ]
          setCurrentPosition(newPosition)
        } else {
          console.error('Error: Unable to get current position.')
          setError(new Error('Unable to get current position'))
        }
      } catch (error) {
        console.error('Error in getCurrentPosition:', error)
        setError(error as Error)
      }
    }

    fetchData()
  }, [])

  if (error) {
    console.error('Error: Unable to get current position.', error)
    return null
  }

  if (currentPosition === null) {
    return <p>Loading...</p>
  }

  const filteredPinsByType = (type) =>
    pinData.filter((pin) => pin.type === type)

  return (
    <MapContainer
      center={currentPosition}
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
      <ZoomLevel setZoomLevel={setZoomLevel} />
    </MapContainer>
  )
}

export default MapSet
