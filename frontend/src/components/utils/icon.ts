import L, { DivIconOptions } from 'leaflet'
import { mapColors } from '@/theme/color'
import { IconType } from '@/types/icon-type'
import { HappinessKey } from '@/types/happiness-key'

type HappinessColers = {
  [key in HappinessKey]: string[]
}

const happinessPalettes: HappinessColers = {
  happiness1: mapColors.BLUE,
  happiness2: mapColors.GREEN,
  happiness3: mapColors.VIOLET,
  happiness4: mapColors.YELLOW,
  happiness5: mapColors.ORANGE,
  happiness6: mapColors.RED,
}

export const getIconByType = (
  iconType: IconType,
  type: HappinessKey,
  answer: number,
  isActive: boolean
) => {
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
        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        border-radius: 3rem 3rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF`
      break
    case 'heatmap':
      markerHtmlStyles = `
        background: radial-gradient(closest-side, ${myCustomColour}, rgba(255, 255, 255, 0));
        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        border-radius: 3rem 3rem 3rem;
        opacity: 0.4`
      break
  }

  const divIconOptions: Omit<DivIconOptions, 'labelAnchor'> = {
    className: 'my-custom-pin',
    iconAnchor: [0, 24],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`,
  }

  return L.divIcon(divIconOptions)
}
