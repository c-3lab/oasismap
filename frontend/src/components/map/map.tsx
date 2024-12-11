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
import React, { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { getIconByType } from '../utils/icon'
import { getCurrentPosition } from '../../libs/geolocation'
import { IconType } from '@/types/icon-type'
import { IconButton } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ReactDOMServer from 'react-dom/server'

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
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [isOverridden] = useState<boolean>(false)

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

    const watchID = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: LatLngTuple = [
          position.coords.latitude,
          position.coords.longitude,
        ]
        setCurrentPosition(newPosition)
        setError(null)
      },
      (err) => {
        console.error(err)
        setError(error)
        setCurrentPosition(null)
      },
      { enableHighAccuracy: true }
    )
    if (isOverridden) {
      setCurrentPosition(null)
    }

    return () => {
      navigator.geolocation.clearWatch(watchID)
    }
  }, [isOverridden, error])

  const filteredPinsByType = (type: string) =>
    pinData.filter((pin) => pin.type === type)

  const currentPositionIcon = ReactDOMServer.renderToString(
    <RadioButtonCheckedIcon style={{ fill: 'blue' }} />
  )
  const myCurrentPositionIcon = divIcon({
    html: currentPositionIcon,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  })

  const MoveToCurrentLocationButton = () => {
    const map = useMap()
    const moveToCurrentLocation = () => {
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
          zIndex: 10000,
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        }}
        onClick={moveToCurrentLocation}
      >
        <MyLocationIcon style={{ color: 'black' }} />
      </IconButton>
    )
  }
  return (
    <MapContainer
      center={currentPosition || [35.6895, 139.6917]} //現在地が取得できない場合は東京の緯度経度を中心に表示
      zoom={defaultZoom}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <MoveToCurrentLocationButton />
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
      {currentPosition && !error && (
        <Marker position={currentPosition} icon={myCurrentPositionIcon}>
          <Popup>現在地</Popup>
        </Marker>
      )}
      <ClosePopup />
    </MapContainer>
  )
}

export default Map
