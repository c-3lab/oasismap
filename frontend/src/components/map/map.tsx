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
import { LatLngTuple, divIcon } from 'leaflet'
import React, { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { IconType } from '@/types/icon-type'
import { ControllablePopup } from './controllablePopup'
import { EntityByEntityId } from '@/types/entityByEntityId'
import { IconButton } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import CurrentPositionIcon from '@mui/icons-material/RadioButtonChecked'
import { renderToString } from 'react-dom/server'

// 環境変数の取得に失敗した場合は日本経緯度原点を設定
const defaultLatitude =
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE!) || 35.6581064
const defaultLongitude =
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE!) || 139.7413637

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

const Map: React.FC<Props> = ({
  iconType,
  pinData,
  selectedEntityId,
  entityByEntityId,
  onPopupClose,
}) => {
  const [center, setCenter] = useState<LatLngTuple | null>(null)
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // geolocation が http に対応していないため固定値を設定
    if (location.protocol === 'http:') {
      setCenter([defaultLatitude, defaultLongitude])
      setCurrentPosition([defaultLatitude, defaultLongitude])
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: LatLngTuple = [
          position.coords.latitude,
          position.coords.longitude,
        ]
        setCenter((prev) => {
          if (!prev) {
            return newPosition
          }
          return prev
        })
        setCurrentPosition(newPosition)
        setError(null)
      },
      (e) => {
        console.error(e)
        setError(e instanceof Error ? e : new Error(e.message))
        setCurrentPosition(null)
        setCenter(null)
      },
      { enableHighAccuracy: true }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const currentPositionIconHTML = renderToString(
    <CurrentPositionIcon style={{ fill: 'blue' }} />
  )
  const currentPositionIcon = divIcon({
    html: currentPositionIconHTML,
    className: 'current-position',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  const MoveToCurrentPositionButton = () => {
    const map = useMap()
    const moveToCurrentPosition = () => {
      if (currentPosition) {
        map.flyTo(currentPosition, defaultZoom)
      }
    }
    return (
      <IconButton
        style={{
          top: '2%',
          left: '2%',
          width: '35px',
          height: '35px',
          backgroundColor: '#f7f7f7',
          border: '1px solid #ccc',
          zIndex: 1000,
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        }}
        onClick={moveToCurrentPosition}
      >
        <MyLocationIcon style={{ color: 'blue' }} />
      </IconButton>
    )
  }
  if (error) {
    console.error('Error: Unable to get current position.', error)
    return null
  }
  if (center === null || currentPosition === null) {
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
      center={center}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <MoveToCurrentPositionButton />
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
      {currentPosition && (
        <Marker position={currentPosition} icon={currentPositionIcon}></Marker>
      )}
      <ClosePopup />
    </MapContainer>
  )
}

export default Map
