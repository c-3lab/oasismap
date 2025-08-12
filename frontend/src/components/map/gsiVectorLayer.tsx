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
    // @ts-ignore - L.canvas.tile is available in leaflet.vectorgrid
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      road: { color: '#808080', weight: 1, opacity: 1 },
      railway: { color: '#008000', weight: 2, opacity: 1 },
      river: { color: '#1E90FF', weight: 1, opacity: 1 },
      lake: { color: '#1E90FF', weight: 1, opacity: 1 },
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

  useEffect(() => {
    if (!map) return

    try {
      if (!blankTileLayerRef.current) {
        blankTileLayerRef.current = L.tileLayer(
          blankTileLayerConfig.url,
          blankTileLayerConfig.options
        ).addTo(map)
      }

      if (!vectorGridRef.current) {
        // @ts-ignore - leaflet.vectorgrid extends L with vectorGrid property
        vectorGridRef.current = L.vectorGrid
          .protobuf(vectorGridConfig.url, vectorGridConfig.options)
          .addTo(map)
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
  }, [map])

  return null
}

export default GSIVectorLayer
