import dynamic from 'next/dynamic'

interface MapProps {
  pointEntities: never[]
  surfaceEntities: never[]
  fiware: {
    servicePath: string
    tenant: string
  }
}

const StarSeekerMap = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

const Map: React.FC<MapProps> = (props) => {
  return (
    <StarSeekerMap
      pointEntities={props.pointEntities}
      surfaceEntities={props.surfaceEntities}
      fiware={props.fiware}
    />
  )
}

export default Map
