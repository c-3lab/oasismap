'use client'
import dynamic from 'next/dynamic'
import styles from './page.module.css'

const Map = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

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
        pinData={[]}
      />
    </main>
  )
}
