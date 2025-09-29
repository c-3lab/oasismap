'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Grid } from '@mui/material'
import { useSession } from 'next-auth/react'
import { PeriodType } from '@/types/period'
import { PROFILE_TYPE } from '@/libs/constants'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import { Pin } from '@/types/pin'
import { Data } from '@/types/happiness-me-response'

type HappinessViewerProps = {
  pinData: Pin[]
  period: PeriodType
  targetEntity: Data | undefined
  type: 'me' | 'all'
}

const HappinessViewer = ({
  pinData,
  period,
  targetEntity,
  type,
}: HappinessViewerProps) => {
  const router = useRouter()
  const isMounted = useRef(false)
  const { data: session } = useSession()

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return (
    <Grid
      container
      sx={{
        paddingBottom: {
          xs: session?.user?.type === PROFILE_TYPE.GENERAL ? '50px' : '0px',
          md: '0px',
        },
      }}
    >
      <Grid
        container
        item
        xs={12}
        sx={{ height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}
      >
        <Map
          pinData={pinData}
          targetEntity={targetEntity}
          onPopupClose={() => {
            // 画面遷移時に発火させないため、マウント時のみクエリパラメータの削除を実行
            isMounted.current && router.replace(`/happiness/${type}`)
          }}
          period={period}
          showAddHappiness={session?.user?.type === PROFILE_TYPE.GENERAL}
          onAddHappiness={() =>
            router.push(`/happiness/input?referral=${type}`)
          }
        />
      </Grid>
    </Grid>
  )
}

export default HappinessViewer
