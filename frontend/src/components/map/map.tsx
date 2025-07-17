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
import React, { useState, useEffect, useContext, useRef } from 'react'
import { LatLng, LatLngTuple, LatLngBounds, divIcon } from 'leaflet'
import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { getIconByType } from '../utils/icon'
import { IconType } from '@/types/icon-type'
import { messageContext } from '@/contexts/message-context'
import { EntityByEntityId } from '@/types/entityByEntityId'
import { IconButton } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import CurrentPositionIcon from '@mui/icons-material/RadioButtonChecked'
import { renderToString } from 'react-dom/server'
import { MeModal } from '../happiness/me-modal'
import { Pin } from '@/types/pin'
import { HAPPINESS_KEYS, questionTitles } from '@/libs/constants'
import { MePopup } from './mePopup'
import { AllPopup } from './allPopup'
import { MessageType } from '@/types/message-type'
import { HighlightTarget } from '@/types/highlight-target'
import { HappinessKey } from '@/types/happiness-key'
import { PeriodType } from '@/types/period'
import { AllModal } from '../happiness/all-modal'

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
  15
)
const maxBounds = new LatLngBounds(new LatLng(-90, -180), new LatLng(90, 180))
const maxBoundsViscosity = 1.0

type Props = {
  pointEntities: any[]
  surfaceEntities: any[]
  fiware: {
    tenant: string
    servicePath: string
  }
  iconType: IconType
  pinData: Pin[]
  initialEntityId?: string | null
  setSelectedLayers?: React.Dispatch<React.SetStateAction<HappinessKey[]>>
  setBounds?: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>
  entityByEntityId?: EntityByEntityId
  onPopupClose?: () => void
  highlightTarget?: HighlightTarget
  setHighlightTarget?: React.Dispatch<React.SetStateAction<HighlightTarget>>
  period?: PeriodType
}

const HighlightListener = ({
  highlightTarget,
  setHighlightTarget,
}: {
  highlightTarget: HighlightTarget
  setHighlightTarget: React.Dispatch<React.SetStateAction<HighlightTarget>>
}) => {
  // グラフクリックによってハイライト状態が変更された場合はポップアップを閉じる
  const map = useMap()

  useEffect(() => {
    if (highlightTarget.lastUpdateBy === 'Graph') {
      map.closePopup()
    }
  }, [highlightTarget.lastUpdateBy, map])

  // マップ上のpin以外の箇所をクリックした場合、全体のハイライトを解除
  useMapEvents({
    click() {
      setHighlightTarget({ lastUpdateBy: 'Map', xAxisValue: null })
    },
  })
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

const pinIsActive = (
  pin: Pin,
  activeTimestamp: { start: Date; end: Date } | null
) => {
  if (!pin.timestamp || !activeTimestamp) return true
  const timestamp = new Date(pin.timestamp)
  return activeTimestamp.start <= timestamp && timestamp <= activeTimestamp.end
}

const convertToXAxisValue = (pin: Pin, period: PeriodType): number | null => {
  if (!pin || !pin.timestamp) return null

  // 現在からdays日前 よりも 指定したdate が未来にあれば true
  function isWithinDays(date: Date, days: number): boolean {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000) < date
  }

  // グラフの範囲外を初期値とする
  let xAxisValue: number = -1
  const date = new Date(pin.timestamp)
  if (period === PeriodType.Month && isWithinDays(date, 365)) {
    xAxisValue = date.getMonth() + 1
  }

  if (period === PeriodType.Day && isWithinDays(date, 30)) {
    xAxisValue = date.getDate()
  }

  if (period === PeriodType.Time && isWithinDays(date, 1)) {
    xAxisValue = date.getHours()
  }

  return xAxisValue
}

const convertToTimestampRange = (
  xAxisValue: number | null,
  period: PeriodType
) => {
  if (xAxisValue === null) return null
  const date = new Date()
  let nowYear = date.getFullYear()
  let nowMonthIndex = date.getMonth()
  let nowMonth = nowMonthIndex + 1
  let nowDate = date.getDate()
  const nowHour = date.getHours()

  if (xAxisValue < 0) {
    // ハイライト対象がグラフ外の値の場合、タイムスタンプをあり得ない値(未来)に設定する
    nowYear += 100
  }

  switch (period) {
    case PeriodType.Month:
      // 現在の月数よりも大きい値の月数が指定された場合、指定された月は去年である
      if (nowMonth < xAxisValue) nowYear -= 1
      return {
        start: new Date(nowYear, xAxisValue - 1, 1),
        end: new Date(nowYear, xAxisValue, 0, 23, 59, 59),
      }

    case PeriodType.Day:
      // 現在の日数よりも大きい値の日数が指定された場合、指定された日にちは先月である
      if (nowDate < xAxisValue) nowMonthIndex -= 1
      return {
        start: new Date(nowYear, nowMonthIndex, xAxisValue, 0, 0, 0),
        end: new Date(nowYear, nowMonthIndex, xAxisValue, 23, 59, 59),
      }

    case PeriodType.Time:
      // 現在の時間よりも大きい値の時間が指定された場合、指定された時間は昨日である
      if (nowHour < xAxisValue) nowDate -= 1
      return {
        start: new Date(nowYear, nowMonthIndex, nowDate, xAxisValue, 0, 0),
        end: new Date(nowYear, nowMonthIndex, nowDate, xAxisValue, 59, 59),
      }
  }
}

const MapOverlay = ({
  iconType,
  type,
  filteredPins,
  initialPopupPin,
  layerIndex,
  setSelectedPin,
  setHighlightTarget,
  period,
  activeTimestamp,
}: {
  iconType: IconType
  type: string
  filteredPins: Pin[]
  initialPopupPin: Pin | undefined
  layerIndex: number
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  setHighlightTarget?: React.Dispatch<React.SetStateAction<HighlightTarget>>
  period?: PeriodType
  activeTimestamp: { start: Date; end: Date } | null
}) => {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (!map || filteredPins.length === 0) return

    // Tạo cluster group nếu chưa có
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 18
      })
      map.addLayer(clusterGroupRef.current)
    }

    // Xóa markers cũ
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers()
    }

    // Thêm markers mới
    filteredPins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: getIconByType(
          iconType,
          pin.type,
          pin.answer,
          pinIsActive(pin, activeTimestamp)
        ),
        zIndexOffset: -layerIndex
      })

      // Thêm popup
      if (iconType === 'pin') {
        marker.bindPopup(() => {
          const div = document.createElement('div')
          const root = createRoot(div)
          root.render(
            <MePopup
              pin={pin}
              initialPopupPin={initialPopupPin}
              setSelectedPin={setSelectedPin}
            />
          )
          return div
        })
      } else {
        marker.bindPopup(() => {
          const div = document.createElement('div')
          const root = createRoot(div)
          root.render(
            <AllPopup pin={pin} setSelectedPin={setSelectedPin} />
          )
          return div
        })
      }

      // Thêm event handler
      marker.on('click', () => {
        if (!setHighlightTarget || !period) return
        setHighlightTarget((highlightTarget: HighlightTarget) => {
          const newXAxisValue = convertToXAxisValue(pin, period)
          if (highlightTarget.xAxisValue === newXAxisValue) {
            return highlightTarget
          } else {
            return { lastUpdateBy: 'Map', xAxisValue: newXAxisValue }
          }
        })
      })

      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayer(marker)
      }
    })

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
        clusterGroupRef.current = null
      }
    }
  }, [map, filteredPins, iconType, layerIndex, activeTimestamp, setHighlightTarget, period, initialPopupPin, setSelectedPin])

  return (
    <LayersControl.Overlay checked name={type}>
      <LayerGroup />
    </LayersControl.Overlay>
  )
}

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
  highlightTarget,
  setHighlightTarget,
  period,
  initialEntityId,
  setSelectedLayers,
  setBounds,
  entityByEntityId,
  onPopupClose,
}) => {
  const [center, setCenter] = useState<LatLngTuple | null>(null)
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const noticeMessageContext = useContext(messageContext)

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
        setCurrentPosition(null)
        setCenter(null)
      },
      { enableHighAccuracy: true }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const MoveToCurrentPositionControl = () => {
    const map = useMap()

    useEffect(() => {
      const control: L.Control = new L.Control({ position: 'bottomright' })

      control.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-control-custom')

        const root = createRoot(div)
        root.render(
          <IconButton
            style={{
              backgroundColor: '#f7f7f7',
              border: '1px solid #ccc',
              borderRadius: 2,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            }}
            onClick={() => {
              if (currentPosition) {
                map.flyTo(currentPosition, defaultZoom)
              }
            }}
          >
            <MyLocationIcon style={{ color: 'blue' }} />
          </IconButton>
        )

        return div
      }

      control.addTo(map)

      return () => {
        control.remove()
      }
    }, [map])

    return null
  }
  if (error) {
    console.error('Error: Unable to get current position.', error)
    return null
  }
  if (center === null || currentPosition === null) {
    return <p>Loading...</p>
  }

  const filteredPinsByType = (type: HappinessKey) =>
    pinData.filter((pin) => pin.type === type)

  let initialEntityUuid: string | undefined = undefined
  if (initialEntityId) {
    initialEntityUuid = entityByEntityId?.[initialEntityId]?.id
  }

  const activeTimestamp: { start: Date; end: Date } | null =
    highlightTarget && period
      ? convertToTimestampRange(highlightTarget.xAxisValue, period)
      : null

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
        {setSelectedLayers && (
          <SelectedLayers setSelectedLayers={setSelectedLayers} />
        )}
        {setBounds && <Bounds setBounds={setBounds} />}
        <MoveToCurrentPositionControl />
        <ZoomControl position={'bottomleft'} />
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="標準地図">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
              minZoom={5}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="淡色地図">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">出典：地理院タイル</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
              maxZoom={18}
              minZoom={5}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
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
                initialPopupPin={filteredPins.find(
                  (pin) => pin.id === initialEntityUuid
                )}
                setSelectedPin={setSelectedPin}
                setHighlightTarget={setHighlightTarget}
                period={period}
                activeTimestamp={activeTimestamp}
              />
            )
          })}
        </LayersControl>
        {onPopupClose && <OnPopupClose onPopupClose={onPopupClose} />}
        {currentPosition && (
          <Marker position={currentPosition} icon={currentPositionIcon} />
        )}
        {highlightTarget && setHighlightTarget && (
          <HighlightListener
            highlightTarget={highlightTarget}
            setHighlightTarget={setHighlightTarget}
          />
        )}
      </MapContainer>
      {iconType === 'pin' ? (
        <MeModal data={selectedPin} onClose={() => setSelectedPin(null)} />
      ) : (
        <AllModal data={selectedPin} onClose={() => setSelectedPin(null)} />
      )}
    </>
  )
}

export default Map
