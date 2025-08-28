'use client'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.vectorgrid'
import { useEffect, useRef } from 'react'

const blankTileLayerConfig = {
  url: 'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
  options: {
    attribution:
      '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
  },
}

const vectorGridConfig = {
  url: 'https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf',
  options: {
    attribution:
      '<a href="https://github.com/gsi-cyberjapan/gsimaps-vector-experiment" target="_blank">国土地理院ベクトルタイル提供実験</a>',
    rendererFactory: (L as any).canvas.tile,
    maxZoom: 17,
    minZoom: 5,
    vectorTileLayerStyles: {
      road: {
        color: 'gray',
        weight: 1,
      },
      railway: {
        color: 'green',
        weight: 2,
      },
      river: {
        color: 'dodgerblue',
        weight: 1,
      },
      lake: {
        color: 'dodgerblue',
        weight: 1,
      },
      // 表示しないレイヤー
      boundary: [],
      building: [],
      coastline: [],
      contour: [],
      elevation: [],
      label: [],
      landforma: [],
      landforml: [],
      landformp: [],
      searoute: [],
      structurea: [],
      structurel: [],
      symbol: [],
      transp: [],
      waterarea: [],
      wstructurea: [],
    },
  },
}

const fallbackTileLayerConfig = {
  url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  options: {
    attribution:
      '<a href="https://maps.gsi.go.jp/development/ichiran.html">出典：地理院タイル</a>',
    maxZoom: 18,
    minZoom: 5,
  },
}

const GSIVectorLayer = () => {
  const map = useMap()
  const blankTileLayerRef = useRef<L.TileLayer | null>(null)
  const vectorGridRef = useRef<any | null>(null)
  const fallbackTileLayerRef = useRef<L.TileLayer | null>(null)

  const handleZoomChange = () => {
    const currentZoom = map.getZoom()

    if (currentZoom > 17) {
      if (vectorGridRef.current) {
        map.removeLayer(vectorGridRef.current)
        vectorGridRef.current = null
      }
      if (!fallbackTileLayerRef.current) {
        fallbackTileLayerRef.current = L.tileLayer(
          fallbackTileLayerConfig.url,
          fallbackTileLayerConfig.options
        ).addTo(map)
      }
    } else {
      if (fallbackTileLayerRef.current) {
        map.removeLayer(fallbackTileLayerRef.current)
        fallbackTileLayerRef.current = null
      }
      if (!vectorGridRef.current) {
        const LWithVectorGrid = L as any
        vectorGridRef.current = LWithVectorGrid.vectorGrid
          .protobuf(vectorGridConfig.url, vectorGridConfig.options)
          .addTo(map)
      }
    }
  }

  useEffect(() => {
    if (!map) return
    map.setView([35.6727, 139.662], 14)

    map.on('zoomend', handleZoomChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps

    try {
      if (!blankTileLayerRef.current) {
        blankTileLayerRef.current = L.tileLayer(
          blankTileLayerConfig.url,
          blankTileLayerConfig.options
        ).addTo(map)
      }

      const currentZoom = map.getZoom()
      if (currentZoom <= 17) {
        if (!vectorGridRef.current) {
          const LWithVectorGrid = L as any
          vectorGridRef.current = LWithVectorGrid.vectorGrid
            .protobuf(vectorGridConfig.url, vectorGridConfig.options)
            .addTo(map)
        }
      } else {
        if (!fallbackTileLayerRef.current) {
          fallbackTileLayerRef.current = L.tileLayer(
            fallbackTileLayerConfig.url,
            fallbackTileLayerConfig.options
          ).addTo(map)
        }
      }
    } catch (error) {
      console.error('Error loading GSI Vector Tiles:', error)
      if (!fallbackTileLayerRef.current) {
        fallbackTileLayerRef.current = L.tileLayer(
          fallbackTileLayerConfig.url,
          fallbackTileLayerConfig.options
        ).addTo(map)
      }
    }

    // Cleanup
    return () => {
      // Remove event listener
      map.off('zoomend', handleZoomChange)

      if (map && blankTileLayerRef.current) {
        map.removeLayer(blankTileLayerRef.current)
        blankTileLayerRef.current = null
      }
      if (map && vectorGridRef.current) {
        map.removeLayer(vectorGridRef.current)
        vectorGridRef.current = null
      }
      if (map && fallbackTileLayerRef.current) {
        map.removeLayer(fallbackTileLayerRef.current)
        fallbackTileLayerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
}

export default GSIVectorLayer
