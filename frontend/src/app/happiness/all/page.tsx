'use client'
import dynamic from 'next/dynamic'
import { useHappinessData } from '@/hooks/use-happiness-data'

const HappinessViewer = dynamic(
  () => import('@/components/happiness/happiness-viewer'),
  { ssr: false }
)

const HappinessAll: React.FC = () => {
  const {
    pinData,
    isLoading,
    period,
    targetEntity,
    handleSearch,
    handlePeriodChange,
  } = useHappinessData({ type: 'all' })

  return (
    <HappinessViewer
      pinData={pinData}
      isLoading={isLoading}
      period={period}
      targetEntity={targetEntity}
      onSearch={handleSearch}
      onPeriodChange={handlePeriodChange}
      type="all"
    />
  )
}

export default HappinessAll
