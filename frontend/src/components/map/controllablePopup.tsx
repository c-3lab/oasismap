import { useEffect, useRef, useState } from 'react'
import { Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  children: React.ReactNode
  isOpened: boolean
  position: [number, number]
}

export const ControllablePopup = ({ children, isOpened, position }: Props) => {
  const map = useMap()
  const [refReady, setRefReady] = useState(false)
  let popupRef = useRef<L.Popup | null>(null)

  useEffect(() => {
    if (refReady && isOpened && popupRef.current) {
      map.setView(position)
      popupRef.current.setLatLng(position).openOn(map)
    }
  }, [refReady, isOpened, position, map])

  return (
    <Popup
      ref={(r) => {
        popupRef.current = r
        setRefReady(true)
      }}
    >
      {children}
    </Popup>
  )
}
