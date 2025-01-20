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
import { LatLngTuple, divIcon } from 'leaflet'
import React, { useState, useEffect, useContext } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { IconType } from '@/types/icon-type'
import { IconButton } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import CurrentPositionIcon from '@mui/icons-material/RadioButtonChecked'
import { renderToString } from 'react-dom/server'
import { MessageType } from '@/types/message-type'
import { messageContext } from '@/contexts/message-context'

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
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
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
}: {
  iconType: IconType
  type: string
  filteredPins: any[]
}) => (
  <LayersControl.Overlay checked name={type}>
    <LayerGroup>
      {filteredPins.map((pin, index) => (
        <Marker
          key={index}
          position={[pin.latitude, pin.longitude]}
          icon={getIconByType(iconType, pin.type, pin.answer)}
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
                {pin.memo !== undefined && (
                  <tr>
                    <th>メモ</th>
                    <th>{pin.memo}</th>
                  </tr>
                )}
              </tbody>
            </table>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  </LayersControl.Overlay>
)

const Map: React.FC<Props> = ({ iconType, pinData }) => {
  const [center, setCenter] = useState<LatLngTuple | null>(null)
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const noticeMessageContext = useContext(messageContext)

  useEffect(() => {
    // geolocation が http に対応していないため固定値を設定
    if (location.protocol === 'http:') {
      setCenter([defaultLatitude, defaultLongitude])
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
      (err) => {
        console.error('Error: Unable to get current position.')
        setError(new Error('Unable to get current position'))
        if (err.code === err.PERMISSION_DENIED) {
          noticeMessageContext.showMessage(
            '位置情報の取得権限がありません、設定から位置情報機能をオンにしてください',
            MessageType.Error
          )
        } else {
          noticeMessageContext.showMessage(
            '位置情報の取得に失敗しました、位置情報が無効になっている可能性があります',
            MessageType.Error
          )
        }
        setCurrentPosition(null)
      },
      { enableHighAccuracy: true }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [noticeMessageContext])

  const filteredPinsByType = (type: string) =>
    pinData.filter((pin) => pin.type === type)

  const currentPositionIconHTML = renderToString(
    <CurrentPositionIcon style={{ fill: 'blue' }} />
  )
  const currentPositionIcon = divIcon({
    html: currentPositionIconHTML,
    className: 'current-position',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
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
        <MyLocationIcon style={{ color: currentPosition ? 'blue' : 'gray' }} />
      </IconButton>
    )
  }
  if (error) {
    console.error('Error: Unable to get current position.', error)
    return null
  }
  if (center === null) {
    return <p>Loading...</p>
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
        {Object.keys(questionTitles).map((type) => (
          <MapOverlay
            key={type}
            iconType={iconType}
            type={questionTitles[type]}
            filteredPins={filteredPinsByType(type)}
          />
        ))}
      </LayersControl>
      {currentPosition && (
        <Marker position={currentPosition} icon={currentPositionIcon}>
          <Popup>現在地</Popup>
        </Marker>
      )}
      <ClosePopup />
    </MapContainer>
  )
}

export default Map
