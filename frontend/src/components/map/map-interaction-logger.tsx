import { pushActionLog } from '@/libs/client-error-reporting'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type MapInteractionKind = 'pan' | 'zoom'

/** 直後に発火する Leaflet イベントのログを何件スキップするか（プログラム操作分） */
const pendingMapInteractionLogSkips: Record<MapInteractionKind, number> = {
  pan: 0,
  zoom: 0,
}

/**
 * panTo / flyTo / Popup autoPan など、コードから地図を動かす直前に呼ぶ。
 * 続く moveend / zoomend ではログを出さず、スキップカウンタだけ消費する。
 */
export function skipMapInteractionLogs(...types: MapInteractionKind[]) {
  for (const type of types) {
    pendingMapInteractionLogSkips[type]++
  }
}

function consumeMapInteractionLogSkip(type: MapInteractionKind): boolean {
  if (pendingMapInteractionLogSkips[type] > 0) {
    pendingMapInteractionLogSkips[type]--
    return true
  }
  return false
}

/**
 * ユーザーのズーム・パンを操作ログに記録する。
 * pinData のマーカー管理 effect とは分離し、ピン 0 件でもリスナーを張る。
 *
 * ホイールズーム 1 回で zoomend → moveend の順に両方来るため、
 * mapZoom と mapPan が連続して記録される（Leaflet の仕様）。
 */
export const MapInteractionLogger = () => {
  const map = useMap()

  useEffect(() => {
    const onZoomEnd = () => {
      if (consumeMapInteractionLogSkip('zoom')) return
      pushActionLog('mapInteraction', 'mapZoom')
    }
    const onMoveEnd = () => {
      if (consumeMapInteractionLogSkip('pan')) return
      pushActionLog('mapInteraction', 'mapPan')
    }

    map.on('zoomend', onZoomEnd)
    map.on('moveend', onMoveEnd)

    return () => {
      map.off('zoomend', onZoomEnd)
      map.off('moveend', onMoveEnd)
    }
  }, [map])

  return null
}
