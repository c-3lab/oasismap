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
  url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  options: {
    attribution:
      '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
    maxZoom: 18,
    minZoom: 5,
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
  const vectorGridRef = useRef<L.TileLayer | null>(null)
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
        vectorGridRef.current = L.tileLayer(
          vectorGridConfig.url,
          vectorGridConfig.options
        ).addTo(map)
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
