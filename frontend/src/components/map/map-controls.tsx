import { IconButton } from '@mui/material'
import NavigationIcon from '@mui/icons-material/Navigation'
import EditIcon from '@mui/icons-material/Edit'
import { LatLngTuple } from 'leaflet'
import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type MoveToCurrentPositionControlProps = {
  currentPositionRef: React.RefObject<LatLngTuple | null>
  defaultZoom: number
}

export const MoveToCurrentPositionControl = ({
  currentPositionRef,
  defaultZoom,
}: MoveToCurrentPositionControlProps) => {
  const map = useMap()

  useEffect(() => {
    const control: L.Control = new L.Control({
      position: 'bottomright',
    })

    let root: Root | null = null

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-control-custom')

      root = createRoot(div)

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
            if (currentPositionRef.current) {
              map.flyTo(currentPositionRef.current, defaultZoom)
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

    control.onRemove = () => {
      queueMicrotask(() => {
        root?.unmount()
        root = null
      })
    }

    return () => {
      control.remove()
    }
  }, [map, defaultZoom, currentPositionRef])

  return null
}

type AddHappinessControlProps = {
  showAddHappiness?: boolean
  onAddHappiness?: () => void
}

export const AddHappinessControl = ({
  showAddHappiness,
  onAddHappiness,
}: AddHappinessControlProps) => {
  const map = useMap()

  const onAddHappinessRef = useRef(onAddHappiness)

  useEffect(() => {
    onAddHappinessRef.current = onAddHappiness
  }, [onAddHappiness])

  useEffect(() => {
    if (!showAddHappiness) {
      return
    }

    const control: L.Control = new L.Control({
      position: 'bottomright',
    })

    let root: Root | null = null

    control.onAdd = () => {
      const div = L.DomUtil.create(
        'div',
        'leaflet-control-custom leaflet-control-add-happiness'
      )

      root = createRoot(div)

      root.render(
        <IconButton
          style={{
            backgroundColor: '#20B2AA',
            borderRadius: 100,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            marginBottom: '10px',
          }}
          onClick={() => {
            onAddHappinessRef.current?.()
          }}
        >
          <EditIcon
            style={{
              color: 'white',
              fontSize: 45,
            }}
          />
        </IconButton>
      )

      return div
    }

    control.addTo(map)

    control.onRemove = () => {
      queueMicrotask(() => {
        root?.unmount()
        root = null
      })
    }

    return () => {
      control.remove()
    }
  }, [map, showAddHappiness])

  return null
}
