import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  LayersControl,
  LayerGroup,
  useMapEvents,
} from 'react-leaflet'
import { LatLngTuple, LatLngBounds } from 'leaflet'
import React, { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { getCurrentPosition } from '../../libs/geolocation'
import { HappinessKey } from '@/types/happiness-key'
import { HAPPINESS_KEYS } from '@/libs/constants'
import { IconType } from '@/types/icon-type'
import { ControllablePopup } from './controllablePopup'
import { EntityByEntityId } from '@/types/entityByEntityId'

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
  setSelectedLayers?: React.Dispatch<React.SetStateAction<HappinessKey[]>>
  setBounds?: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>
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

type QuestionTitles = Record<HappinessKey, string>
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
}: {
  iconType: IconType
  type: string
  filteredPins: any[]
  layerIndex: number
  selectedPin: any
}) => (
  <LayersControl.Overlay checked name={type}>
    <LayerGroup>
      {filteredPins.map((pin, index) => (
        <Marker
          key={index}
          position={[pin.latitude, pin.longitude]}
          icon={getIconByType(iconType, pin.type, pin.answer)}
          zIndexOffset={-layerIndex}
        >
          <ControllablePopup
            isOpened={pin.id === selectedPin?.id}
            position={[pin.latitude, pin.longitude]}
          >
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
                  <th>{Math.round(pin.answer1 * 10) / 10}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness2}</th>
                  <th>{Math.round(pin.answer2 * 10) / 10}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness3}</th>
                  <th>{Math.round(pin.answer3 * 10) / 10}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness4}</th>
                  <th>{Math.round(pin.answer4 * 10) / 10}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness5}</th>
                  <th>{Math.round(pin.answer5 * 10) / 10}</th>
                </tr>
                <tr>
                  <th>{questionTitles.happiness6}</th>
                  <th>{Math.round(pin.answer6 * 10) / 10}</th>
                </tr>
              </tbody>
            </table>
          </ControllablePopup>
        </Marker>
      ))}
    </LayerGroup>
  </LayersControl.Overlay>
)

const SelectedLayers = ({
  setSelectedLayers,
}: {
  setSelectedLayers: React.Dispatch<React.SetStateAction<HappinessKey[]>>
}) => {
  useMapEvents({
    overlayadd: (e) => {
      const targetLayer = HAPPINESS_KEYS.find(
        (key) => questionTitles[key] === e.name
      )
      if (targetLayer) {
        setSelectedLayers((selectedLayers: HappinessKey[]) => [
          ...selectedLayers,
          targetLayer,
        ])
      }
    },
    overlayremove: (e) => {
      const targetLayer = HAPPINESS_KEYS.find(
        (key) => questionTitles[key] === e.name
      )
      if (targetLayer) {
        setSelectedLayers((selectedLayers: HappinessKey[]) =>
          [...selectedLayers].filter((layer) => layer !== targetLayer)
        )
      }
    },
  })
  return null
}

const Bounds = ({
  setBounds,
}: {
  setBounds: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>
}) => {
  const map = useMap()

  useEffect(() => {
    setBounds(map.getBounds())
  }, [setBounds, map])

  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds())
    },
  })
  return null
}

const Map: React.FC<Props> = ({
  iconType,
  pinData,
  setSelectedLayers,
  setBounds,
  selectedEntityId,
  entityByEntityId,
  onPopupClose,
}) => {
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
      {setSelectedLayers && (
        <SelectedLayers setSelectedLayers={setSelectedLayers} />
      )}
      {setBounds && <Bounds setBounds={setBounds} />}
      <ZoomControl position={'bottomleft'} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
        minZoom={5}
      />
      <LayersControl position="topright">
        {HAPPINESS_KEYS.map((type, index) => {
          const filteredPins = filteredPinsByType(type)
          return (
            <MapOverlay
              key={type}
              iconType={iconType}
              type={questionTitles[type]}
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
    </MapContainer>
  )
}

export default Map
