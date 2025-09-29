'use client'
import dynamic from 'next/dynamic'
import { useHappinessData } from '@/hooks/use-happiness-data'

const HappinessViewer = dynamic(
  () => import('@/components/happiness/happiness-viewer'),
  { ssr: false }
)

const HappinessMe: React.FC = () => {
  const { pinData, period, targetEntity } = useHappinessData({ type: 'me' })

  return (
    <HappinessViewer
      pinData={pinData}
      period={period}
      targetEntity={targetEntity}
      type="me"
    />
  )
}

export default HappinessMe
