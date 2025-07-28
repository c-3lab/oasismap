import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  Marker,
  LayersControl,
  LayerGroup,
  useMapEvents,
  Popup,
} from 'react-leaflet'
import React, { useState, useEffect, useContext, useRef } from 'react'

import { useSession } from 'next-auth/react'
import { LatLng, LatLngTuple, LatLngBounds, divIcon } from 'leaflet'
import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
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
import { HAPPINESS_KEYS, PROFILE_TYPE, questionTitles } from '@/libs/constants'
import { MePopup } from './mePopup'
import { AllPopup } from './allPopup'
import { MessageType } from '@/types/message-type'
import { HighlightTarget } from '@/types/highlight-target'
import { HappinessKey } from '@/types/happiness-key'
import { PeriodType } from '@/types/period'
import { AllModal } from '../happiness/all-modal'

const AllPopupWrapper = ({
  pin,
  setSelectedPin,
  session,
}: {
  pin: Pin
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  session: any
}) => {
  return (
    <AllPopup pin={pin} setSelectedPin={setSelectedPin} session={session} />
  )
}

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

const HybridClusterGroup = ({
  iconType,
  pinData,
  setSelectedPin,
  setHighlightTarget,
  period,
  activeTimestamp,
  selectedLayers,
  _session,
}: {
  iconType: IconType
  pinData: Pin[]
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  setHighlightTarget?: React.Dispatch<React.SetStateAction<HighlightTarget>>
  period?: PeriodType
  activeTimestamp: { start: Date; end: Date } | null
  selectedLayers?: HappinessKey[]
  _session: any
}) => {
  const map = useMap()
  const happinessClustersRef = useRef<{ [key: string]: L.MarkerClusterGroup }>(
    {}
  )
  const superClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const [popupPin, setPopupPin] = useState<Pin | null>(null)
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(
    null
  )

  useEffect(() => {
    // Create happiness clusters
    HAPPINESS_KEYS.forEach((happinessType) => {
      if (!happinessClustersRef.current[happinessType]) {
        happinessClustersRef.current[happinessType] = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: loadEnvAsNumber(
            process.env.NEXT_PUBLIC_MAX_CLUSTER_RADIUS,
            200
          ),
          disableClusteringAtZoom: 12, // Cluster when zoom < 12
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true,
          removeOutsideVisibleBounds: true,
          animate: true,
          animateAddingMarkers: false,
          iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount()

            // Color based on specific happiness type
            const happinessNumber = happinessType.slice(-1)
            const className = `cluster-happiness${happinessNumber}`

            // Increase icon size based on marker count
            let iconSize = 40
            if (count > 10) iconSize = 50
            if (count > 50) iconSize = 60
            if (count > 100) iconSize = 70
            if (count > 500) iconSize = 80

            return L.divIcon({
              html: `<div class="marker-cluster ${className}" style="
                background-color: ${
                  happinessType === 'happiness1'
                    ? '#007fff'
                    : happinessType === 'happiness2'
                      ? '#4BA724'
                      : happinessType === 'happiness3'
                        ? '#7f00ff'
                        : happinessType === 'happiness4'
                          ? '#FF69B4'
                          : happinessType === 'happiness5'
                            ? '#ff7f00'
                            : '#ff0000'
                };
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                min-width: ${iconSize}px;
                min-height: ${iconSize}px;
                border: 2px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              ">
                <div>
                  <span style="
                    color: white;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                  ">${count}</span>
                </div>
              </div>`,
              className: '',
              iconSize: L.point(iconSize, iconSize),
            })
          },
        })
      }
    })

    // Create super cluster for all pins
    if (!superClusterRef.current) {
      superClusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: loadEnvAsNumber(
          process.env.NEXT_PUBLIC_MAX_CLUSTER_RADIUS,
          200
        ), // Environment variable for cluster radius
        disableClusteringAtZoom: 12, // Only cluster when zoom < 12
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        removeOutsideVisibleBounds: true,
        animate: true,
        animateAddingMarkers: false,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount()

          // Gray color for super cluster
          const className = 'cluster-total'

          // Increase icon size based on marker count (same as sub clusters)
          let iconSize = 40
          if (count > 10) iconSize = 50
          if (count > 50) iconSize = 60
          if (count > 100) iconSize = 70
          if (count > 500) iconSize = 80

          return L.divIcon({
            html: `<div class="marker-cluster ${className}" style="
              background-color: rgba(255, 255, 255, 0.9);
              color: #333;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              min-width: ${iconSize}px;
              min-height: ${iconSize}px;
              border: 2px solid rgba(0, 0, 0, 0.3);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            ">
              <div>
                <span style="
                  color: #333;
                  font-weight: bold;
                  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
                ">${count}</span>
              </div>
            </div>`,
            className: '',
            iconSize: L.point(iconSize, iconSize),
          })
        },
      })
    }

    // Function to update cluster display based on zoom level
    const updateClusters = () => {
      const zoomLevel = map.getZoom()

      if (zoomLevel < 10) {
        // Zoom out: show super cluster, hide color clusters
        Object.values(happinessClustersRef.current).forEach((cluster) => {
          if (map.hasLayer(cluster)) {
            map.removeLayer(cluster)
          }
        })
        if (!map.hasLayer(superClusterRef.current!)) {
          map.addLayer(superClusterRef.current!)
        }
      } else {
        // Zoom in: show color clusters, hide super cluster
        if (map.hasLayer(superClusterRef.current!)) {
          map.removeLayer(superClusterRef.current!)
        }
        Object.entries(happinessClustersRef.current).forEach(
          ([_type, cluster]) => {
            if (!map.hasLayer(cluster)) {
              map.addLayer(cluster)
            }
          }
        )
      }
    }

    if (!map || pinData.length === 0) {
      return
    }

    // Clear old markers from all cluster groups
    Object.values(happinessClustersRef.current).forEach((clusterGroup) => {
      clusterGroup.clearLayers()
    })
    if (superClusterRef.current) {
      superClusterRef.current.clearLayers()
    }

    // Filter pins based on selectedLayers
    const filteredPins =
      selectedLayers && selectedLayers.length > 0
        ? pinData.filter((pin) => selectedLayers.includes(pin.type))
        : pinData

    // Add markers to both color clusters and super cluster
    filteredPins.forEach((pin, _index) => {
      // Check if this pin type has a value > 0 based on pin.type
      const happinessValues = {
        happiness1: pin.answer1,
        happiness2: pin.answer2,
        happiness3: pin.answer3,
        happiness4: pin.answer4,
        happiness5: pin.answer5,
        happiness6: pin.answer6,
      }
      const pinValue = happinessValues[pin.type]

      if (pinValue <= 0) {
        return
      }

      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: getIconByType(
          iconType,
          pin.type,
          pin.answer,
          pinIsActive(pin, activeTimestamp)
        ),
      })

      // Add event handler
      marker.on('click', () => {
        // Set popup
        setPopupPin(pin)
        setPopupPosition([pin.latitude, pin.longitude])

        // Handle highlight
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

      // Add marker to color cluster based on pin type
      if (happinessClustersRef.current[pin.type]) {
        happinessClustersRef.current[pin.type].addLayer(marker)
      }

      // Add marker to super cluster (copy)
      const superMarker = L.marker([pin.latitude, pin.longitude], {
        icon: getIconByType(
          iconType,
          pin.type,
          pin.answer,
          pinIsActive(pin, activeTimestamp)
        ),
      })

      // Add event handler for super marker
      superMarker.on('click', () => {
        // Set popup
        setPopupPin(pin)
        setPopupPosition([pin.latitude, pin.longitude])

        // Handle highlight
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

      if (superClusterRef.current) {
        superClusterRef.current.addLayer(superMarker)
      }
    })

    // Update initial cluster display
    updateClusters()

    // Listen to zoom events to update clusters
    map.on('zoomend', updateClusters)

    return () => {
      // Remove event listener
      map.off('zoomend', updateClusters)

      // Remove all cluster groups
      Object.values(happinessClustersRef.current).forEach((clusterGroup) => {
        if (map.hasLayer(clusterGroup)) {
          map.removeLayer(clusterGroup)
        }
      })
      if (superClusterRef.current && map.hasLayer(superClusterRef.current)) {
        map.removeLayer(superClusterRef.current)
      }
      happinessClustersRef.current = {}
      superClusterRef.current = null
    }
  }, [
    map,
    pinData,
    iconType,
    activeTimestamp,
    setHighlightTarget,
    period,
    setSelectedPin,
    selectedLayers,
  ])

  // Add click handler to close popup when clicking on map
  useEffect(() => {
    if (!map) return

    const handleMapClick = () => {
      setPopupPin(null)
      setPopupPosition(null)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map])

  return (
    <>
      {popupPin && popupPosition && (
        <Popup
          autoPan={_session?.user?.type === PROFILE_TYPE.ADMIN ? false : true}
          position={popupPosition}
          offset={[0, -20]}
          eventHandlers={{
            remove: () => {
              setPopupPin(null)
              setPopupPosition(null)
            },
          }}
        >
          {iconType === 'pin' ? (
            <MePopup
              pin={popupPin}
              initialPopupPin={undefined}
              setSelectedPin={setSelectedPin}
            />
          ) : (
            <AllPopupWrapper
              pin={popupPin}
              setSelectedPin={setSelectedPin}
              session={_session}
            />
          )}
        </Popup>
      )}
    </>
  )
}

const MapOverlay = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  iconType,
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filteredPins,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialPopupPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layerIndex,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setHighlightTarget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  period,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  setBounds,
  entityByEntityId,
  onPopupClose,
}) => {
  const { data: session } = useSession()
  const [center, setCenter] = useState<LatLngTuple | null>(null)
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [selectedLayers, setSelectedLayersState] =
    useState<HappinessKey[]>(HAPPINESS_KEYS)
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
    pinData.filter((pin) => {
      // For happiness-all data, check if pin type matches and has value > 0
      // For happiness-me data, check if the specified happiness type has value > 0
      const happinessValues = {
        happiness1: pin.answer1,
        happiness2: pin.answer2,
        happiness3: pin.answer3,
        happiness4: pin.answer4,
        happiness5: pin.answer5,
        happiness6: pin.answer6,
      }

      // Check if pin type matches the filter type and has value > 0
      return pin.type === type && happinessValues[type] > 0
    })

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
        <SelectedLayers setSelectedLayers={setSelectedLayersState} />
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
        <HybridClusterGroup
          iconType={iconType}
          pinData={pinData}
          setSelectedPin={setSelectedPin}
          setHighlightTarget={setHighlightTarget}
          period={period}
          activeTimestamp={activeTimestamp}
          selectedLayers={selectedLayers}
          _session={session}
        />

        {/* Keep LayersControl to display legend but don't create separate cluster */}
        <LayersControl position="topright">
          {HAPPINESS_KEYS.map((type, index) => {
            const filteredPins = filteredPinsByType(type)
            return (
              <MapOverlay
                key={type}
                iconType={iconType}
                type={questionTitles[type]}
                filteredPins={filteredPins}
                initialPopupPin={filteredPins.find(
                  (pin) => pin.id === initialEntityUuid
                )}
                layerIndex={index}
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
