'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

const Home: React.FC = () => {
  return (
    <main>
      <div>
        <h1>OASISmap</h1>
      </div>
      <Map
        pointEntities={[]}
        surfaceEntities={[]}
        fiware={{ servicePath: '', tenant: '' }}
      />
    </main>
  )
}

export default Home
