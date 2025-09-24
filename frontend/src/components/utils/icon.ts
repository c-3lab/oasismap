import L from 'leaflet'
import { HappinessKey } from '@/types/happiness-key'

// SVG mapping for happiness types
const happinessIcons: { [key in HappinessKey]: string } = {
  happiness1: '/happy1.svg',
  happiness2: '/happy2.svg',
  happiness3: '/happy3.svg',
  happiness4: '/happy4.svg',
  happiness5: '/happy5.svg',
  happiness6: '/happy6.svg',
}

export const getIconByType = (
  type: HappinessKey,
  answer: number,
  isActive: boolean
) => {
  const svgUrl = happinessIcons[type] || '/happy1.svg'

  return new L.Icon({
    iconUrl: svgUrl,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
    className: isActive ? 'active-pin' : 'inactive-pin',
  })
}
