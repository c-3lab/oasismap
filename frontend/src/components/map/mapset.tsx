import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import React, { Dispatch, SetStateAction } from 'react'
import 'leaflet/dist/leaflet.css'
import {
  redIcon,
  red9Icon,
  red8Icon,
  red7Icon,
  red6Icon,
  red5Icon,
  red4Icon,
  red3Icon,
  red2Icon,
  red1Icon,
  blueIcon,
  blue9Icon,
  blue8Icon,
  blue7Icon,
  blue6Icon,
  blue5Icon,
  blue4Icon,
  blue3Icon,
  blue2Icon,
  blue1Icon,
  greenIcon,
  green9Icon,
  green8Icon,
  green7Icon,
  green6Icon,
  green5Icon,
  green4Icon,
  green3Icon,
  green2Icon,
  green1Icon,
  yellowIcon,
  yellow9Icon,
  yellow8Icon,
  yellow7Icon,
  yellow6Icon,
  yellow5Icon,
  yellow4Icon,
  yellow3Icon,
  yellow2Icon,
  yellow1Icon,
  orangeIcon,
  orange9Icon,
  orange8Icon,
  orange7Icon,
  orange6Icon,
  orange5Icon,
  orange4Icon,
  orange3Icon,
  orange2Icon,
  orange1Icon,
  violetIcon,
  violet9Icon,
  violet8Icon,
  violet7Icon,
  violet6Icon,
  violet5Icon,
  violet4Icon,
  violet3Icon,
  violet2Icon,
  violet1Icon,
} from '../utils/marker'

const getIconByType = (type: string, answer: number) => {
  switch (type) {
    case 'happiness1':
      return getIconForHappiness1(answer)
    case 'happiness2':
      return getIconForHappiness2(answer)
    case 'happiness3':
      return getIconForHappiness3(answer)
    case 'happiness4':
      return getIconForHappiness4(answer)
    case 'happiness5':
      return getIconForHappiness5(answer)
    case 'happiness6':
      return getIconForHappiness6(answer)
    default:
      return redIcon
  }
}

const getIconForHappiness1 = (answer: number) => {
  switch (answer) {
    case 1:
      return blueIcon
    case 0.9:
      return blue9Icon
    case 0.8:
      return blue8Icon
    case 0.7:
      return blue7Icon
    case 0.6:
      return blue6Icon
    case 0.5:
      return blue5Icon
    case 0.4:
      return blue4Icon
    case 0.3:
      return blue3Icon
    case 0.2:
      return blue2Icon
    case 0.1:
      return blue1Icon
    default:
      return blueIcon
  }
}

const getIconForHappiness2 = (answer: number) => {
  switch (answer) {
    case 1:
      return greenIcon
    case 0.9:
      return green9Icon
    case 0.8:
      return green8Icon
    case 0.7:
      return green7Icon
    case 0.6:
      return green6Icon
    case 0.5:
      return green5Icon
    case 0.4:
      return green4Icon
    case 0.3:
      return green3Icon
    case 0.2:
      return green2Icon
    case 0.1:
      return green1Icon
    default:
      return greenIcon
  }
}

const getIconForHappiness3 = (answer: number) => {
  switch (answer) {
    case 1:
      return violetIcon
    case 0.9:
      return violet9Icon
    case 0.8:
      return violet8Icon
    case 0.7:
      return violet7Icon
    case 0.6:
      return violet6Icon
    case 0.5:
      return violet5Icon
    case 0.4:
      return violet4Icon
    case 0.3:
      return violet3Icon
    case 0.2:
      return violet2Icon
    case 0.1:
      return violet1Icon
    default:
      return violetIcon
  }
}

const getIconForHappiness4 = (answer: number) => {
  switch (answer) {
    case 1:
      return yellowIcon
    case 0.9:
      return yellow9Icon
    case 0.8:
      return yellow8Icon
    case 0.7:
      return yellow7Icon
    case 0.6:
      return yellow6Icon
    case 0.5:
      return yellow5Icon
    case 0.4:
      return yellow4Icon
    case 0.3:
      return yellow3Icon
    case 0.2:
      return yellow2Icon
    case 0.1:
      return yellow1Icon
    default:
      return yellowIcon
  }
}

const getIconForHappiness5 = (answer: number) => {
  switch (answer) {
    case 1:
      return orangeIcon
    case 0.9:
      return orange9Icon
    case 0.8:
      return orange8Icon
    case 0.7:
      return orange7Icon
    case 0.6:
      return orange6Icon
    case 0.5:
      return orange5Icon
    case 0.4:
      return orange4Icon
    case 0.3:
      return orange3Icon
    case 0.2:
      return orange2Icon
    case 0.1:
      return orange1Icon
    default:
      return orangeIcon
  }
}

const getIconForHappiness6 = (answer: number) => {
  switch (answer) {
    case 1:
      return redIcon
    case 0.9:
      return red9Icon
    case 0.8:
      return red8Icon
    case 0.7:
      return red7Icon
    case 0.6:
      return red6Icon
    case 0.5:
      return red5Icon
    case 0.4:
      return red4Icon
    case 0.3:
      return red3Icon
    case 0.2:
      return red2Icon
    case 0.1:
      return red1Icon
    default:
      return redIcon
  }
}

const loadEnvAsNumber = (
  variable: string | undefined,
  defaultValue: number
): number => {
  if (!variable) return defaultValue
  const value = parseFloat(variable)
  if (Number.isNaN(value)) return defaultValue
  return value
}

const defaultLatitude = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE),
  35.6581107
)
const defaultLongitude = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE),
  139.7387888
)
const defaultZoom = loadEnvAsNumber(
  String(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM),
  13
)

const defaultPosition: LatLngTuple = [defaultLatitude, defaultLongitude]

type Props = {
  pointEntities: any[]
  surfaceEntities: any[]
  fiware: {
    tenant: string
    servicePath: string
  }
  pinData: any[]
  setZoomLevel?: Dispatch<SetStateAction<number>>
}

const ClosePopup = () => {
  const map = useMap()
  map.closePopup()
  return null
}

const ZoomLevel: React.FC<{
  setZoomLevel?: Dispatch<SetStateAction<number>>
}> = ({ setZoomLevel }) => {
  const map = useMapEvents({
    zoomend: () => {
      if (!setZoomLevel) return
      setZoomLevel(map.getZoom())
    },
  })
  return null
}

const questionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export { questionTitles }

const MapSet: React.FC<Props> = ({ pinData, setZoomLevel }) => {
  const h1 = pinData.filter((pin) => pin.type === 'happiness1')
  const h2 = pinData.filter((pin) => pin.type === 'happiness2')
  const h3 = pinData.filter((pin) => pin.type === 'happiness3')
  const h4 = pinData.filter((pin) => pin.type === 'happiness4')
  const h5 = pinData.filter((pin) => pin.type === 'happiness5')
  const h6 = pinData.filter((pin) => pin.type === 'happiness6')

  return (
    <MapContainer
      center={defaultPosition}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <ZoomControl position={'bottomleft'} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topright">
        <LayersControl.Overlay checked name={questionTitles['happiness1']}>
          <LayerGroup>
            {h1.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitles['happiness2']}>
          <LayerGroup>
            {h2.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitles['happiness3']}>
          <LayerGroup>
            {h3.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitles['happiness4']}>
          <LayerGroup>
            {h4.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitles['happiness5']}>
          <LayerGroup>
            {h5.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name={questionTitles['happiness6']}>
          <LayerGroup>
            {h6.map((pin, index) => (
              <Marker
                key={index}
                position={[pin.latitude, pin.longitude]}
                icon={getIconByType(pin.type, pin.answer)}
              >
                <Popup>
                  <table border={1}>
                    {pin.basetime && (
                      <tr>
                        <th>回答日時</th>
                        <th>{pin.timestamp}</th>
                      </tr>
                    )}
                    <tr>
                      <th>ワクワクする場所</th>
                      <th>{pin.answer1}</th>
                    </tr>
                    <tr>
                      <th>発見の学びの場所</th>
                      <th>{pin.answer2}</th>
                    </tr>
                    <tr>
                      <th>ホッとする場所</th>
                      <th>{pin.answer3}</th>
                    </tr>
                    <tr>
                      <th>自分を取り戻せる場所</th>
                      <th>{pin.answer4}</th>
                    </tr>
                    <tr>
                      <th>自慢の場所</th>
                      <th>{pin.answer5}</th>
                    </tr>
                    <tr>
                      <th>思い出の場所</th>
                      <th>{pin.answer6}</th>
                    </tr>
                  </table>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>

      <ClosePopup />
      <ZoomLevel setZoomLevel={setZoomLevel} />
    </MapContainer>
  )
}

export default MapSet
