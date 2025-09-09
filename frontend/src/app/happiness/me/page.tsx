'use client'
import dynamic from 'next/dynamic'

const HappinessAllUserComponent = dynamic(
  () => import('@/components/commons/happiness-user')
)

const HappinessMe: React.FC = () => {
  return <HappinessAllUserComponent type="me" />
}

export default HappinessMe
