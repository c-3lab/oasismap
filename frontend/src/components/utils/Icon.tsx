import { createColoredIcon } from './marker'
import { colorSet } from '@/theme/color'

export const getIconByType = (type: string, answer: number) => {
  switch (type) {
    case 'happiness1':
      return getIconForHappiness(answer, colorSet["BLUE"])
    case 'happiness2':
      return getIconForHappiness(answer, colorSet["GREEN"])
    case 'happiness3':
      return getIconForHappiness(answer, colorSet["VIOLET"])
    case 'happiness4':
      return getIconForHappiness(answer, colorSet["YELLOW"])
    case 'happiness5':
      return getIconForHappiness(answer, colorSet["ORANGE"])
    case 'happiness6':
      return getIconForHappiness(answer, colorSet["RED"])
    default:
      return getIconForHappiness(1, colorSet["RED"])
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
