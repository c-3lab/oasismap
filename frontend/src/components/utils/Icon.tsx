import L, { DivIconOptions } from 'leaflet'
import { mapColors } from '@/theme/color'

export const getIconByType = (type: string, answer: number) => {
  switch (type) {
    case 'happiness1':
      return getIconForHappiness(answer, mapColors["BLUE"])
    case 'happiness2':
      return getIconForHappiness(answer, mapColors["GREEN"])
    case 'happiness3':
      return getIconForHappiness(answer, mapColors["VIOLET"])
    case 'happiness4':
      return getIconForHappiness(answer, mapColors["YELLOW"])
    case 'happiness5':
      return getIconForHappiness(answer, mapColors["ORANGE"])
    case 'happiness6':
      return getIconForHappiness(answer, mapColors["RED"])
    default:
      return getIconForHappiness(1, mapColors["RED"])
  }
}

const getIconForHappiness = (answer: number, palette: string[]) => {
  switch (answer) {
    case 1:
      return createColoredIcon(palette[0])
    case 0.9:
      return createColoredIcon(palette[9])
    case 0.8:
      return createColoredIcon(palette[8])
    case 0.7:
      return createColoredIcon(palette[7])
    case 0.6:
      return createColoredIcon(palette[6])
    case 0.5:
      return createColoredIcon(palette[5])
    case 0.4:
      return createColoredIcon(palette[4])
    case 0.3:
      return createColoredIcon(palette[3])
    case 0.2:
      return createColoredIcon(palette[2])
    case 0.1:
      return createColoredIcon(palette[1])
    default:
      return createColoredIcon(palette[0])
  }
}

const createColoredIcon = (color: string): L.DivIcon => {
  const myCustomColour = color

  const markerHtmlStyles = `
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

  const divIconOptions: Omit<DivIconOptions, 'labelAnchor'> = {
    className: 'my-custom-pin',
    iconAnchor: [0, 24],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`,
  }

  return L.divIcon(divIconOptions)
}
