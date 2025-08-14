import L, { DivIconOptions } from 'leaflet'
import { mapColors } from '@/theme/color'
import { IconType } from '@/types/icon-type'
import { HappinessKey } from '@/types/happiness-key'

type HappinessColers = {
  [key in HappinessKey]: string[]
}

const happinessPalettes: HappinessColers = {
  happiness1: mapColors.RED,
  happiness2: mapColors.BLUE,
  happiness3: mapColors.GREEN,
  happiness4: mapColors.YELLOW,
  happiness5: mapColors.ORANGE,
  happiness6: mapColors.VIOLET,
}

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
  iconType: IconType,
  type: HappinessKey,
  answer: number,
  isActive: boolean
) => {
  // Use SVG icons for pin type
  if (iconType === 'pin') {
    const svgUrl = happinessIcons[type] || '/happy1.svg'

    return new L.Icon({
      iconUrl: svgUrl,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
      className: isActive ? 'active-pin' : 'inactive-pin',
    })
  }

  // Fallback to colored icons for heatmap type
  if (!isActive) {
    return createColoredIcon(iconType, 'grey')
  }
  const palette = happinessPalettes[type]

  switch (answer) {
    case 1:
      return createColoredIcon(iconType, palette[0])
    case 0.9:
      return createColoredIcon(iconType, palette[9])
    case 0.8:
      return createColoredIcon(iconType, palette[8])
    case 0.7:
      return createColoredIcon(iconType, palette[7])
    case 0.6:
      return createColoredIcon(iconType, palette[6])
    case 0.5:
      return createColoredIcon(iconType, palette[5])
    case 0.4:
      return createColoredIcon(iconType, palette[4])
    case 0.3:
      return createColoredIcon(iconType, palette[3])
    case 0.2:
      return createColoredIcon(iconType, palette[2])
    case 0.1:
      return createColoredIcon(iconType, palette[1])
    default:
      return createColoredIcon(iconType, palette[0])
  }
}

const createColoredIcon = (iconType: IconType, color: string): L.DivIcon => {
  const myCustomColour = color

  let markerHtmlStyles
  switch (iconType) {
    case 'pin':
      markerHtmlStyles = `
        background-color: ${myCustomColour};
        width: 50px;
        height: 50px;
        display: block;
        left: -25px;
        top: -25px;
        position: relative;
        border-radius: 50px 50px 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF`
      break
    case 'heatmap':
      markerHtmlStyles = `
        background: radial-gradient(closest-side, ${myCustomColour}, rgba(255, 255, 255, 0));
        width: 50px;
        height: 50px;
        display: block;
        left: -25px;
        top: -25px;
        position: relative;
        border-radius: 50px 50px 50px;
        opacity: 0.4`
      break
  }

  const divIconOptions: Omit<DivIconOptions, 'labelAnchor'> = {
    className: 'my-custom-pin',
    iconAnchor: [0, 50],
    popupAnchor: [0, -50],
    html: `<span style="${markerHtmlStyles}" />`,
  }

  return L.divIcon(divIconOptions)
}
