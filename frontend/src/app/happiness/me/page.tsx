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
    happinessData,
    entityByEntityId,
    isLoading,
    period,
    highlightTarget,
    initialEntityId,
    handleSearch,
    handlePeriodChange,
    handleHighlightChange,
  } = useHappinessData({ type: 'me' })

  return (
    <HappinessViewer
      pinData={pinData}
      happinessData={happinessData}
      entityByEntityId={entityByEntityId}
      isLoading={isLoading}
      period={period}
      highlightTarget={highlightTarget}
      initialEntityId={initialEntityId}
      onSearch={handleSearch}
      onPeriodChange={handlePeriodChange}
      onHighlightChange={handleHighlightChange}
      type="me"
    />
  )
}

export default HappinessMe
