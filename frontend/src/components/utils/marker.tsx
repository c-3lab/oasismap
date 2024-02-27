import L, { DivIconOptions } from 'leaflet'

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

export const redIcon = createColoredIcon('#ff0000')
export const red9Icon = createColoredIcon('#ff1919')
export const red8Icon = createColoredIcon('#ff2323')
export const red7Icon = createColoredIcon('#ff2d2d')
export const red6Icon = createColoredIcon('#ff3838')
export const red5Icon = createColoredIcon('#ff4242')
export const red4Icon = createColoredIcon('#ff4c4c')
export const red3Icon = createColoredIcon('#ff5656')
export const red2Icon = createColoredIcon('#ff6666')
export const red1Icon = createColoredIcon('#ff7070')

export const blueIcon = createColoredIcon('#007fff')
export const blue9Icon = createColoredIcon('#1e8eff')
export const blue8Icon = createColoredIcon('#2893ff')
export const blue7Icon = createColoredIcon('#3399ff')
export const blue6Icon = createColoredIcon('#3d9eff')
export const blue5Icon = createColoredIcon('#47a3ff')
export const blue4Icon = createColoredIcon('#51a8ff')
export const blue3Icon = createColoredIcon('#5badff')
export const blue2Icon = createColoredIcon('#66b2ff')
export const blue1Icon = createColoredIcon('#70b7ff')

export const greenIcon = createColoredIcon('#00ff00')
export const green9Icon = createColoredIcon('#1eff1e')
export const green8Icon = createColoredIcon('#28ff28')
export const green7Icon = createColoredIcon('#33ff33')
export const green6Icon = createColoredIcon('#3dff3d')
export const green5Icon = createColoredIcon('#47ff47')
export const green4Icon = createColoredIcon('#51ff51')
export const green3Icon = createColoredIcon('#5bff5b')
export const green2Icon = createColoredIcon('#66ff66')
export const green1Icon = createColoredIcon('#70ff70')

export const yellowIcon = createColoredIcon('#ffff00')
export const yellow9Icon = createColoredIcon('#ffff1e')
export const yellow8Icon = createColoredIcon('#ffff28')
export const yellow7Icon = createColoredIcon('#ffff33')
export const yellow6Icon = createColoredIcon('#ffff3d')
export const yellow5Icon = createColoredIcon('#ffff47')
export const yellow4Icon = createColoredIcon('#ffff51')
export const yellow3Icon = createColoredIcon('#ffff5b')
export const yellow2Icon = createColoredIcon('#ffff66')
export const yellow1Icon = createColoredIcon('#ffff70')

export const orangeIcon = createColoredIcon('#ff7f00')
export const orange9Icon = createColoredIcon('#ff8e1e')
export const orange8Icon = createColoredIcon('#ff9328')
export const orange7Icon = createColoredIcon('#ff9933')
export const orange6Icon = createColoredIcon('#ff9e3d')
export const orange5Icon = createColoredIcon('#ffa347')
export const orange4Icon = createColoredIcon('#ffa851')
export const orange3Icon = createColoredIcon('#ffab5b')
export const orange2Icon = createColoredIcon('#ffb266')
export const orange1Icon = createColoredIcon('#ffb770')

export const violetIcon = createColoredIcon('#7f00ff')
export const violet9Icon = createColoredIcon('#8e1eff')
export const violet8Icon = createColoredIcon('#9328ff')
export const violet7Icon = createColoredIcon('#9933ff')
export const violet6Icon = createColoredIcon('#9e3dff')
export const violet5Icon = createColoredIcon('#a347ff')
export const violet4Icon = createColoredIcon('#a851ff')
export const violet3Icon = createColoredIcon('#ad5bff')
export const violet2Icon = createColoredIcon('#b266ff')
export const violet1Icon = createColoredIcon('#b770ff')
