'use client'
import dynamic from 'next/dynamic'
import { useHappinessData } from '@/hooks/use-happiness-data'

const HappinessViewer = dynamic(
  () => import('@/components/happiness/happiness-viewer'),
  { ssr: false }
)

const HappinessMe: React.FC = () => {
  const { pinData, targetEntity } = useHappinessData({ type: 'me' })

  return (
    <HappinessViewer pinData={pinData} targetEntity={targetEntity} type="me" />
  )
}

export default HappinessMe
