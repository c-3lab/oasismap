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
    happinessData,
    entityByEntityId,
    isLoading,
    period,
    highlightTarget,
    initialEntityId,
    handleSearch,
    handlePeriodChange,
    handleHighlightChange,
  } = useHappinessData({ type: 'all' })

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
      type="all"
    />
  )
}

export default HappinessAll
