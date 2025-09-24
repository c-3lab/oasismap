'use client'
import dynamic from 'next/dynamic'
import { useHappinessData } from '@/hooks/use-happiness-data'

const HappinessViewer = dynamic(
  () => import('@/components/happiness/happiness-viewer'),
  { ssr: false }
)

const HappinessMe: React.FC = () => {
  const {
    pinData,
    isLoading,
    period,
    targetEntity,
    handleSearch,
    handlePeriodChange,
  } = useHappinessData({ type: 'me' })

  return (
    <HappinessViewer
      pinData={pinData}
      isLoading={isLoading}
      period={period}
      targetEntity={targetEntity}
      onSearch={handleSearch}
      onPeriodChange={handlePeriodChange}
      type="me"
    />
  )
}

export default HappinessMe
