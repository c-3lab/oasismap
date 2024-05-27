import L, { DivIconOptions } from 'leaflet'

export const createColoredIcon = (color: string): L.DivIcon => {
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
