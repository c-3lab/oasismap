import L, { DivIconOptions } from 'leaflet'
import { mapColors } from '@/theme/color'
import { IconType } from '@/types/icon-type'

export const getIconByType = (
  iconType: IconType,
  type: string,
  answer: number
) => {
  switch (type) {
    case 'happiness1':
      return getIconForHappiness(iconType, answer, mapColors['BLUE'])
    case 'happiness2':
      return getIconForHappiness(iconType, answer, mapColors['GREEN'])
    case 'happiness3':
      return getIconForHappiness(iconType, answer, mapColors['VIOLET'])
    case 'happiness4':
      return getIconForHappiness(iconType, answer, mapColors['YELLOW'])
    case 'happiness5':
      return getIconForHappiness(iconType, answer, mapColors['ORANGE'])
    case 'happiness6':
      return getIconForHappiness(iconType, answer, mapColors['RED'])
    default:
      return getIconForHappiness(iconType, 1, mapColors['RED'])
  }
}

const getIconForHappiness = (
  iconType: IconType,
  answer: number,
  palette: string[]
) => {
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
