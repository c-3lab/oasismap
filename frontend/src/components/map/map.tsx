import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  useMapEvents,
  Popup,
} from 'react-leaflet'
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react'

import { useSession } from 'next-auth/react'
import { LatLng, LatLngTuple, LatLngBounds, divIcon } from 'leaflet'
import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getIconByType } from '../utils/icon'
import { messageContext } from '@/contexts/message-context'

import { IconButton } from '@mui/material'
import NavigationIcon from '@mui/icons-material/Navigation'
import CurrentPositionIcon from '@mui/icons-material/RadioButtonChecked'
import EditIcon from '@mui/icons-material/Edit'
import { renderToString } from 'react-dom/server'
import { MeModal } from '../happiness/me-modal'
import { Pin } from '@/types/pin'
import { HAPPINESS_KEYS, PROFILE_TYPE } from '@/libs/constants'
import { MePopup } from './mePopup'
import { MessageType } from '@/types/message-type'
import { HappinessKey } from '@/types/happiness-key'

import { PeriodType } from '@/types/period'
import { HappinessFields } from '@/types/happiness-set'
import { Data } from '@/types/happiness-me-response'
import { mapColors } from '@/theme/color'

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
  pinData: Pin[]
  targetEntity?: Data
  onPopupClose?: () => void
  period?: PeriodType
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

// Helper functions for cluster creation
const getIconSize = (count: number): number => {
  if (count > 500) return 80
  if (count > 100) return 70
  if (count > 50) return 60
  if (count > 10) return 50
  return 40
}

const getPinValue = (pin: Pin): number => {
  const happinessValues: HappinessFields = {
    happiness1: pin.answer1,
    happiness2: pin.answer2,
    happiness3: pin.answer3,
    happiness4: pin.answer4,
    happiness5: pin.answer5,
    happiness6: pin.answer6,
  }
  return happinessValues[pin.type]
}

const createClusterIcon = ({
  count,
  backgroundColor,
  textColor,
  borderColor,
  textShadow,
}: {
  count: number
  backgroundColor: string
  textColor: string
  borderColor: string
  textShadow: string
}) => {
  const iconSize = getIconSize(count)

  return L.divIcon({
    html: `<div class="marker-cluster" style="
      background-color: ${backgroundColor};
      color: ${textColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      min-width: ${iconSize}px;
      min-height: ${iconSize}px;
      border: 2px solid ${borderColor};
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    ">
      <span style="
        color: ${textColor};
        font-weight: bold;
        text-shadow: ${textShadow};
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      ">${count}</span>
    </div>`,
    className: '',
    iconSize: L.point(iconSize, iconSize),
  })
}

const HybridClusterGroup = ({
  pinData,
  setSelectedPin,
  period,
  session,
  targetEntity,
}: {
  pinData: Pin[]
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  period?: PeriodType
  session: any
  targetEntity?: Data
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

  // Helper functions for cluster management
  const getMarkerClusterGroupProps = useCallback(
    () => ({
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
    }),
    []
  )

  const getHappinessColorPalette = useCallback(
    (): { [key in HappinessKey]: string } => ({
      happiness1: mapColors.RED[0],
      happiness2: mapColors.BLUE[0],
      happiness3: mapColors.GREEN[0],
      happiness4: mapColors.YELLOW[0],
      happiness5: mapColors.ORANGE[0],
      happiness6: mapColors.VIOLET[0],
    }),
    []
  )

  const createHappinessClusters = useCallback(() => {
    const markerClusterGroupProps = getMarkerClusterGroupProps()
    const happinessColorPalette = getHappinessColorPalette()

    HAPPINESS_KEYS.forEach((happinessType) => {
      if (!happinessClustersRef.current[happinessType]) {
        happinessClustersRef.current[happinessType] = L.markerClusterGroup({
          ...markerClusterGroupProps,
          iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount()

            return createClusterIcon({
              count,
              backgroundColor:
                happinessColorPalette[happinessType] || '#7f00ff',
              textColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.8)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            })
          },
        })
      }
    })
  }, [getMarkerClusterGroupProps, getHappinessColorPalette])

  const createSuperCluster = useCallback(() => {
    const markerClusterGroupProps = getMarkerClusterGroupProps()

    if (!superClusterRef.current) {
      superClusterRef.current = L.markerClusterGroup({
        ...markerClusterGroupProps,
        iconCreateFunction: (cluster) => {
          return createClusterIcon({
            count: cluster.getChildCount(),
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            textColor: '#333',
            borderColor: 'rgba(0, 0, 0, 0.3)',
            textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
          })
        },
      })
    }
  }, [getMarkerClusterGroupProps])

  const createMarkerClickHandler = useCallback(
    (pin: Pin) => {
      return () => {
        // Set popup
        setPopupPin(pin)
        setPopupPosition([pin.latitude, pin.longitude])
      }
    },
    [setPopupPin, setPopupPosition]
  )

  // Logic to automatically open popup for targetEntity
  useEffect(() => {
    if (!targetEntity || !map || pinData.length === 0) {
      return
    }

    // Find the pin that matches the targetEntity
    const targetPin = pinData.find((pin) => pin.id === targetEntity.id)
    if (!targetPin) {
      return
    }

    // Open popup and pan to the target pin
    setPopupPin(targetPin)
    setPopupPosition([targetPin.latitude, targetPin.longitude])
    map.panTo([targetPin.latitude, targetPin.longitude])
  }, [targetEntity, map, pinData])

  const updateClusters = useCallback(() => {
    const zoomLevel = map.getZoom()

    if (zoomLevel < 0) {
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
  }, [map])

  useEffect(() => {
    // Initialize clusters
    createHappinessClusters()
    createSuperCluster()

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

    // Add markers to both color clusters and super cluster
    pinData.forEach((pin) => {
      // Check if this pin type has a value > 0 based on pin.type
      if (getPinValue(pin) <= 0) {
        return
      }

      // Add marker to color cluster based on pin type
      if (happinessClustersRef.current[pin.type]) {
        const marker = L.marker([pin.latitude, pin.longitude], {
          icon: getIconByType(pin.type),
        })

        // Add event handler
        marker.on('click', createMarkerClickHandler(pin))

        happinessClustersRef.current[pin.type].addLayer(marker)
      }

      // Add marker to super cluster (copy)
      if (superClusterRef.current) {
        const superMarker = L.marker([pin.latitude, pin.longitude], {
          icon: getIconByType(pin.type),
        })

        // Add event handler for super marker
        superMarker.on('click', createMarkerClickHandler(pin))

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
    period,
    setSelectedPin,
    createHappinessClusters,
    createSuperCluster,
    createMarkerClickHandler,
    updateClusters,
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
          autoPan={session?.user?.type === PROFILE_TYPE.ADMIN ? false : true}
          position={popupPosition}
          offset={[0, -20]}
          eventHandlers={{
            remove: () => {
              setPopupPin(null)
              setPopupPosition(null)
            },
          }}
        >
          <MePopup pin={popupPin} setSelectedPin={setSelectedPin} />
        </Popup>
      )}
    </>
  )
}

const Map: React.FC<Props> = ({
  pinData,
  period,
  targetEntity,
  onPopupClose,
  showAddHappiness,
  onAddHappiness,
}) => {
  const { data: session } = useSession()
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
    <CurrentPositionIcon style={{ fill: '#20B2AA' }} />
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
              borderRadius: 100,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              marginBottom: '10px',
            }}
            onClick={() => {
              if (currentPosition) {
                map.flyTo(currentPosition, defaultZoom)
              }
            }}
          >
            <NavigationIcon
              style={{
                color: '#20B2AA',
                transform: 'rotate(45deg)',
                fontSize: 45,
              }}
            />
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

  const AddHappinessControl = () => {
    const map = useMap()

    useEffect(() => {
      if (!showAddHappiness) {
        return
      }

      const control: L.Control = new L.Control({ position: 'bottomright' })

      control.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-control-custom')

        const root = createRoot(div)
        root.render(
          <IconButton
            style={{
              backgroundColor: '#20B2AA',
              borderRadius: 100,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              marginBottom: '10px',
            }}
            onClick={() => {
              if (onAddHappiness) {
                onAddHappiness()
              }
            }}
          >
            <EditIcon
              style={{
                color: 'white',
                fontSize: 55,
              }}
            />
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
        <AddHappinessControl />
        <MoveToCurrentPositionControl />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={5}
        />
        <HybridClusterGroup
          pinData={pinData}
          setSelectedPin={setSelectedPin}
          period={period}
          session={session}
          targetEntity={targetEntity}
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
