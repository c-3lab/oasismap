import { HappinessFields } from '@/types/happiness-set'
import { Pin } from '@/types/pin'
import L from 'leaflet'
import { Data } from '@/types/happiness-me-response'
import { Popup, useMap } from 'react-leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HappinessKey } from '@/types/happiness-key'
import { mapColors } from '@/theme/color'
import { HAPPINESS_KEYS, PROFILE_TYPE } from '@/libs/constants'
import { getIconByType } from '../utils/icon'
import { MePopup } from './mePopup'
import 'leaflet.markercluster'

// MarkerClusterGroupの型定義（leaflet.markerclusterの型定義を参照）
interface MarkerClusterGroupType extends L.LayerGroup {
  addLayers(layers: L.Layer[]): this
  removeLayers(layers: L.Layer[]): this
  clearLayers(): this
  getChildCount(): number
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

export const HybridClusterGroup = ({
  pinData,
  setSelectedPin,
  session,
  targetEntity,
  maxClusterRadius,
}: {
  pinData: Pin[]
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  session: any
  targetEntity?: Data
  maxClusterRadius?: number
}) => {
  const map = useMap()
  const happinessClustersRef = useRef<{
    [key: string]: MarkerClusterGroupType
  }>({})
  const superClusterRef = useRef<MarkerClusterGroupType | null>(null)
  const [popupPin, setPopupPin] = useState<Pin | null>(null)
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(
    null
  )

  // Helper functions for cluster management
  const getMarkerClusterGroupProps = useCallback(
    () => ({
      chunkedLoading: true,
      maxClusterRadius,
      disableClusteringAtZoom: 12, // Cluster when zoom < 12
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: false,
    }),
    [maxClusterRadius]
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
        happinessClustersRef.current[happinessType] = (
          L as any
        ).markerClusterGroup({
          ...markerClusterGroupProps,
          iconCreateFunction: (cluster: any) => {
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
      superClusterRef.current = (L as any).markerClusterGroup({
        ...markerClusterGroupProps,
        iconCreateFunction: (cluster: any) => {
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
