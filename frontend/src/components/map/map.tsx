import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  LayersControl,
  LayerGroup,
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { getCurrentPosition } from '../../libs/geolocation'
import { IconType } from '@/types/icon-type'
import { DetailModal } from '../happiness/detailModal'
import { Pin } from '@/types/pin'
import { questionTitles } from '@/libs/constants'
import { MePopup } from './mePopup'
import { AllPopup } from './allPopup'

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
  iconType: IconType
  pinData: any[]
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
  return null
}

export { questionTitles }

const MapOverlay = ({
  iconType,
  type,
  filteredPins,
  setSelectedPin,
}: {
  iconType: IconType
  type: string
  filteredPins: Pin[]
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
}) => (
  <LayersControl.Overlay checked name={type}>
    <LayerGroup>
      {filteredPins.map((pin, index) => (
        <Marker
          key={index}
          position={[pin.latitude, pin.longitude]}
          icon={getIconByType(iconType, pin.type, pin.answer)}
        >
          {iconType === 'pin' ? (
            <MePopup pin={pin} setSelectedPin={setSelectedPin} />
          ) : (
            <AllPopup pin={pin} />
          )}
        </Marker>
      ))}
    </LayerGroup>
  </LayersControl.Overlay>
)

const Map: React.FC<Props> = ({ iconType, pinData }) => {
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)

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

  const filteredPinsByType = (type: string) =>
    pinData.filter((pin) => pin.type === type)

  return (
    <>
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
          maxZoom={18}
          minZoom={5}
        />
        <LayersControl position="topright">
          {Object.keys(questionTitles).map((type) => (
            <MapOverlay
              key={type}
              iconType={iconType}
              type={questionTitles[type]}
              filteredPins={filteredPinsByType(type)}
              setSelectedPin={setSelectedPin}
            />
          ))}
        </LayersControl>
        {!selectedPin && <ClosePopup />}
      </MapContainer>
      <DetailModal data={selectedPin} onClose={() => setSelectedPin(null)} />
    </>
  )
}

export default Map
