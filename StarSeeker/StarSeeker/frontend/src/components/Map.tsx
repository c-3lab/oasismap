import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup} from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import React from 'react';
import 'leaflet/dist/leaflet.css';
import DisplayPoints from './DisplayPoints';
import DisplaySurfaces from './DisplaySurfaces';
import L from 'leaflet'
L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/';

const defaultPosition: LatLngTuple = [
  process.env.NEXT_PUBLIC_MAP_DEFAULT_LATITUDE,
  process.env.NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE,
];
const defalutZoom: number = process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM;

type Props = {
  pointEntities: any[];
  surfaceEntities: any[];
  fiware: any[];
  pinData: any[]; //追加
};

const ClosePopup = () => {
  const map = useMap();
  map.closePopup();
  return null;
};

const Map: React.VFC<Props> = ({ pointEntities, surfaceEntities, fiware, pinData}) => {
  return (
    <MapContainer
      center={defaultPosition}
      zoom={defalutZoom}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <ZoomControl position={'bottomleft'} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pointEntities.map((data, index) => (
        <DisplayPoints key={index} data={data} fiware={fiware} />
      ))}
      {surfaceEntities.map((data, index) => (
        <DisplaySurfaces key={index} data={data} fiware={fiware} />
      ))}
      {pinData.map((pin, index) => (
        <Marker
          key={index}
          position={[pin.latitude, pin.longitude]}
        >
          <Popup>
            <p>{pin.title}</p>
          </Popup>
        </Marker>
      ))}
      <ClosePopup />
    </MapContainer>
  );
};

export default Map;
