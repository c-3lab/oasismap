'use client'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

const GSIVectorLayer = () => {
  const map = useMap()

  useEffect(() => {
    try {
      // Add blank tile layer as background
      const blankTileLayer = L.tileLayer(
        'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
        {
          attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        }
      ).addTo(map)

      // @ts-ignore - leaflet.vectorgrid extends L with vectorGrid property
      const vectorGrid = L.vectorGrid
        .protobuf(
          'https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf',
          {
            attribution:
              '<a href="https://github.com/gsi-cyberjapan/gsimaps-vector-experiment" target="_blank">国土地理院ベクトルタイル提供実験</a>',
            // @ts-ignore - L.canvas.tile is available in leaflet.vectorgrid
            rendererFactory: L.canvas.tile,
            vectorTileLayerStyles: {
              road: {
                color: '#808080',
                weight: 1,
                opacity: 1,
              },
              railway: {
                color: '#008000',
                weight: 2,
                opacity: 1,
              },
              river: {
                color: '#1E90FF',
                weight: 1,
                opacity: 1,
              },
              lake: {
                color: '#1E90FF',
                weight: 1,
                opacity: 1,
              },
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
          }
        )
        .addTo(map)

      return () => {
        if (map && blankTileLayer) {
          map.removeLayer(blankTileLayer)
        }
        if (map && vectorGrid) {
          map.removeLayer(vectorGrid)
        }
      }
    } catch (error) {
      console.error('Error loading GSI Vector Tiles:', error)
      // Fallback to regular tiles if vector tiles fail
      const tileLayer = L.tileLayer(
        'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        {
          attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html">出典：地理院タイル</a>',
          maxZoom: 18,
          minZoom: 5,
        }
      ).addTo(map)

      return () => {
        if (map && tileLayer) {
          map.removeLayer(tileLayer)
        }
      }
    }
  }, [map])

  return null
}

export default GSIVectorLayer
