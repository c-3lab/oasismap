import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react'

import { useSession } from 'next-auth/react'
import { LatLng, LatLngTuple, LatLngBounds, divIcon } from 'leaflet'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { messageContext } from '@/contexts/message-context'

import CurrentPositionIcon from '@mui/icons-material/RadioButtonChecked'
import { renderToString } from 'react-dom/server'
import { MeModal } from '../happiness/me-modal'
import { Pin } from '@/types/pin'
import { handleTileError } from '@/components/utils/tile-fallback-log'
import { MessageType } from '@/types/message-type'

import { Data } from '@/types/happiness-me-response'
import { useRuntimeConfig } from '@/contexts/runtime-config-context'
import {
  AddHappinessControl,
  MoveToCurrentPositionControl,
} from './map-controls'
import { HybridClusterGroup } from './hybrid-cluster-group'

const loadEnvAsNumber = (
  variable: string | undefined,
  defaultValue: number
): number => {
  if (!variable) return defaultValue
  const value = parseFloat(variable)
  if (Number.isNaN(value)) return defaultValue
  return value
}

const DEFAULT_LATITUDE = 35.6581064
const DEFAULT_LONGITUDE = 139.7413637
const DEFAULT_ZOOM = 15
const DEFAULT_MAX_CLUSTER_RADIUS = 200

const maxBounds = new LatLngBounds(new LatLng(-90, -180), new LatLng(90, 180))
const maxBoundsViscosity = 1.0

type Props = {
  pinData: Pin[]
  targetEntity?: Data
  onPopupClose?: () => void
  showAddHappiness?: boolean
  onAddHappiness?: () => void
}

const OnPopupClose = ({ onPopupClose }: { onPopupClose: () => void }) => {
  useMapEvents({
    popupclose: () => {
      onPopupClose()
    },
  })
  return null
}

const Map: React.FC<Props> = ({
  pinData,
  targetEntity,
  onPopupClose,
  showAddHappiness,
  onAddHappiness,
}) => {
  const config = useRuntimeConfig()
  const defaultLatitude =
    parseFloat(config.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE ?? '') ||
    DEFAULT_LATITUDE
  const defaultLongitude =
    parseFloat(config.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE ?? '') ||
    DEFAULT_LONGITUDE
  const defaultZoom = loadEnvAsNumber(
    config.NEXT_PUBLIC_MAP_DEFAULT_ZOOM,
    DEFAULT_ZOOM
  )
  const maxClusterRadius = loadEnvAsNumber(
    config.NEXT_PUBLIC_MAX_CLUSTER_RADIUS,
    DEFAULT_MAX_CLUSTER_RADIUS
  )

  const { data: session } = useSession()
  const [center, setCenter] = useState<LatLngTuple | null>(null)
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const noticeMessageContext = useContext(messageContext)
  const [useFallback, setUseFallback] = useState(false)

  const currentPositionRef = useRef<LatLngTuple | null>(null)

  const updateCurrentPosition = useCallback((position: LatLngTuple | null) => {
    setCurrentPosition(position)
    currentPositionRef.current = position
  }, [])

  useEffect(() => {
    // geolocation が http に対応していないため固定値を設定
    if (location.protocol === 'http:') {
      const fixedPosition: LatLngTuple = [defaultLatitude, defaultLongitude]

      setCenter(fixedPosition)
      updateCurrentPosition(fixedPosition)

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
        updateCurrentPosition(newPosition)

        setError(null)
      },
      (e) => {
        console.error(e)
        setError(e instanceof Error ? e : new Error(e.message))
        if (e.code === e.PERMISSION_DENIED) {
          noticeMessageContext.showMessage(
            '位置情報機能が無効になっている可能性があります。設定から位置情報機能を有効にしてください。',
            MessageType.Error
          )
        } else {
          noticeMessageContext.showMessage(
            '位置情報の取得に失敗しました。',
            MessageType.Error
          )
        }
        updateCurrentPosition(null)
        setCenter(null)
      },
      { enableHighAccuracy: true }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [
    defaultLatitude,
    defaultLongitude,
    noticeMessageContext,
    updateCurrentPosition,
  ])

  const currentPositionIconHTML = renderToString(
    <CurrentPositionIcon style={{ fill: '#20B2AA' }} />
  )
  const currentPositionIcon = divIcon({
    html: currentPositionIconHTML,
    className: 'current-position',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  if (error) {
    console.error('Error: Unable to get current position.', error)
    return null
  }
  if (center === null || currentPosition === null) {
    return <p>Loading...</p>
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        maxBounds={maxBounds}
        maxBoundsViscosity={maxBoundsViscosity}
      >
        <AddHappinessControl
          showAddHappiness={showAddHappiness}
          onAddHappiness={onAddHappiness}
        />
        <MoveToCurrentPositionControl
          currentPositionRef={currentPositionRef}
          defaultZoom={defaultZoom}
        />
        {!useFallback && (
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            minZoom={5}
            eventHandlers={{
              tileerror: () => handleTileError(setUseFallback),
            }}
          />
        )}
        {useFallback && (
          <TileLayer
            attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
            url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
            maxZoom={18}
            minZoom={5}
          />
        )}
        <HybridClusterGroup
          pinData={pinData}
          setSelectedPin={setSelectedPin}
          session={session}
          targetEntity={targetEntity}
          maxClusterRadius={maxClusterRadius}
        />
        {onPopupClose && <OnPopupClose onPopupClose={onPopupClose} />}
        {currentPosition && (
          <Marker position={currentPosition} icon={currentPositionIcon} />
        )}
      </MapContainer>
      <MeModal data={selectedPin} onClose={() => setSelectedPin(null)} />
    </>
  )
}

export default Map
