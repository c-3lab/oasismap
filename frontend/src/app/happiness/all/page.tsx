'use client'
import dynamic from 'next/dynamic'
import { useHappinessData } from '@/hooks/use-happiness-data'

const HappinessViewer = dynamic(
  () => import('@/components/happiness/happiness-viewer'),
  { ssr: false }
)

const HappinessAll: React.FC = () => {
  const { pinData, targetEntity } = useHappinessData({ type: 'all' })

  return (
    <HappinessViewer pinData={pinData} targetEntity={targetEntity} type="all" />
  )
}

export default HappinessAll
