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
    highlightTarget,
    targetEntity,
    handleSearch,
    handlePeriodChange,
    handleHighlightChange,
  } = useHappinessData({ type: 'me' })

  return (
    <HappinessViewer
      pinData={pinData}
      isLoading={isLoading}
      period={period}
      highlightTarget={highlightTarget}
      targetEntity={targetEntity}
      onSearch={handleSearch}
      onPeriodChange={handlePeriodChange}
      onHighlightChange={handleHighlightChange}
      type="me"
    />
  )
}

export default HappinessMe
