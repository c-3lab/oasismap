import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  LayersControl,
  LayerGroup,
  useMapEvents,
  Popup
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { getCurrentPosition } from '../../libs/geolocation'
import { IconType } from '@/types/icon-type'
import { ControllablePopup } from './controllablePopup'
import { EntityByEntityId } from '@/types/entityByEntityId'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Data } from '@/types/happiness-list-response'
import { OpenModal } from '../happiness/modal'

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
  selectedEntityId?: string | null
  entityByEntityId?: EntityByEntityId
  onPopupClose?: () => void
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
  return null
}

const OnPopupClose = ({ onPopupClose }: { onPopupClose: () => void }) => {
  useMapEvents({
    popupclose: () => {
      onPopupClose()
    },
  })
  return null
}

interface QuestionTitles {
  [key: string]: string
}
const questionTitles: QuestionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export { questionTitles }

const MapOverlay = ({
  iconType,
  type,
  filteredPins,
  layerIndex,
  selectedPin,
  setSelectedPin,
}: {
  iconType: IconType
  type: string
  filteredPins: any[]
  layerIndex: number
  selectedPin: any
  setSelectedPin: any
}) => {
  return (
    <LayersControl.Overlay checked name={type}>
      <LayerGroup>
        {filteredPins.map((pin, index) => (
          <Marker
            key={index}
            position={[pin.latitude, pin.longitude]}
            icon={getIconByType(iconType, pin.type, pin.answer)}
          >
            <Popup>
              {iconType === 'pin' && (
                <>
                  {pin.answer1 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#007fff',
                        }}
                      />
                      <a style={{ color: '#007fff' }}>
                        {questionTitles.happiness1}
                      </a>
                    </h3>
                  )}
                  {pin.answer1 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#007fff',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness1}
                      </a>
                    </h3>
                  )}
                  {pin.answer2 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#4BA724',
                        }}
                      />
                      <a style={{ color: '#4BA724' }}>
                        {questionTitles.happiness2}
                      </a>
                    </h3>
                  )}
                  {pin.answer2 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#4BA724',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness2}
                      </a>
                    </h3>
                  )}
                  {pin.answer3 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#7f00ff',
                        }}
                      />
                      <a style={{ color: '#7f00ff' }}>
                        {questionTitles.happiness3}
                      </a>
                    </h3>
                  )}
                  {pin.answer3 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#7f00ff',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness3}
                      </a>
                    </h3>
                  )}
                  {pin.answer4 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#FF00D8',
                        }}
                      />
                      <a style={{ color: '#FF00D8' }}>
                        {questionTitles.happiness4}
                      </a>
                    </h3>
                  )}
                  {pin.answer4 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#FF00D8',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness4}
                      </a>
                    </h3>
                  )}
                  {pin.answer5 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#ff7f00',
                        }}
                      />
                      <a style={{ color: '#ff7f00' }}>
                        {questionTitles.happiness5}
                      </a>
                    </h3>
                  )}
                  {pin.answer5 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#ff7f00',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness5}
                      </a>
                    </h3>
                  )}
                  {pin.answer6 === 1 && (
                    <h3 style={{ display: 'flex' }}>
                      <CheckCircleIcon
                        sx={{
                          fontSize: 'large',
                          color: '#ff0000',
                        }}
                      />
                      <a style={{ color: '#ff0000' }}>
                        {questionTitles.happiness6}
                      </a>
                    </h3>
                  )}
                  {pin.answer6 === 0 && (
                    <h3 style={{ display: 'flex' }}>
                      <a
                        style={{
                          color: '#ff0000',
                          opacity: 0.3,
                          marginLeft: '18px',
                        }}
                      >
                        {questionTitles.happiness6}
                      </a>
                    </h3>
                  )}
                  {pin.memo !== undefined && (
                    <div
                      style={{
                        marginTop: '4px',
                      }}
                    >
                      <h4>
                        {pin.memo.length > 10 ? (
                          <>
                            {pin.memo.slice(0, 10)}…
                            <button
                              style={{
                                backgroundColor: 'transparent',
                                color: 'blue',
                                border: 'solid 0px',
                              }}
                              onClick={() => setSelectedPin(pin)}
                            >
                              もっと見る
                            </button>
                          </>
                        ) : (
                          pin.memo
                        )}
                      </h4>
                    </div>
                  )}
                  {pin.basetime && (
                    <div
                      style={{
                        marginTop: '4px',
                        marginLeft: '30%',
                      }}
                    >
                      <h5>
                        回答日時：
                        {pin.timestamp}
                      </h5>
                    </div>
                  )}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    </LayersControl.Overlay>
  )
}

const Map: React.FC<Props> = ({
  iconType,
  pinData,
  selectedEntityId,
  entityByEntityId,
  onPopupClose,
}) => {
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [selectedPin, setSelectedPin] = useState<Data | null>(null)

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

  let selectedEntityUuid: string | undefined = undefined
  if (selectedEntityId) {
    selectedEntityUuid = entityByEntityId?.[selectedEntityId]?.id
  }

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
        maxZoom={18}
        minZoom={5}
      />
      <LayersControl position="topright">
        {Object.keys(questionTitles).map((type, index) => {
          const filteredPins = filteredPinsByType(type)
          return (
            <MapOverlay
              key={type}
              iconType={iconType}
              type={questionTitles[type]}
              setSelectedPin={setSelectedPin}
              layerIndex={index}
              filteredPins={filteredPins}
              selectedPin={filteredPins.find(
                (pin) => pin.id === selectedEntityUuid
              )}
            />
          )
        })}
      </LayersControl>
      {!selectedEntityId && <ClosePopup />}
      {onPopupClose && <OnPopupClose onPopupClose={onPopupClose} />}
      <OpenModal data={selectedPin} onClose={() => setSelectedPin(null)} />
    </MapContainer>
  )
}

export default Map
