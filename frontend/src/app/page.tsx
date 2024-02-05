'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import customData from './customData.json'

const Map = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

const pinData = customData.map((data) => ({
  latitude: data.latitude,
  longitude: data.longitude,
  title: `ピン${customData.indexOf(data) + 1}`,
}))

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <h1>OASISmap</h1>
      </div>
      <Map
        pointEntities={[]}
        surfaceEntities={[]}
        fiware={{ servicePath: '', tenant: '' }}
        pinData={pinData}
      />
    </main>
  )
}
