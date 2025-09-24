'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { useSession } from 'next-auth/react'
import { PeriodType } from '@/types/period'
import { PROFILE_TYPE } from '@/libs/constants'
const Map = dynamic(() => import('@/components/map/map'), { ssr: false })
import {
  DateTimeTextbox,
  useDateTimeProps,
} from '@/components/fields/date-time-textbox'
import { DateTime as OasismapDateTime } from '@/types/datetime'
import { Pin } from '@/types/pin'
import { Data } from '@/types/happiness-me-response'

type HappinessViewerProps = {
  pinData: Pin[]
  isLoading: boolean
  period: PeriodType
  targetEntity: Data | undefined
  type: 'me' | 'all'
  onSearch: (
    startDateTime: OasismapDateTime,
    endDateTime: OasismapDateTime
  ) => Promise<void>
  onPeriodChange: (period: PeriodType) => void
}

const HappinessViewer = ({
  pinData,
  isLoading,
  period,
  targetEntity,
  type,
  onSearch,
  onPeriodChange,
}: HappinessViewerProps) => {
  const router = useRouter()
  const isMounted = useRef(false)
  const searchParams = useSearchParams()
  const timestamp = searchParams.get('timestamp')
  const { startProps, endProps } = useDateTimeProps(period, timestamp)
  const { data: session } = useSession()

  const handleSearch = async () => {
    const startDateTime = startProps.value
    const endDateTime = endProps.value
    await onSearch(startDateTime, endDateTime)
  }

  const handlePeriodChange = (newPeriod: PeriodType) => {
    onPeriodChange(newPeriod)
  }

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
        md={6}
        sx={{ height: { xs: '50vh', md: 'calc(100vh - 64px)' } }}
      >
        <Map
          pointEntities={[]}
          surfaceEntities={[]}
          fiware={{ servicePath: '', tenant: '' }}
          pinData={pinData}
          targetEntity={targetEntity}
          onPopupClose={() => {
            // 画面遷移時に発火させないため、マウント時のみクエリパラメータの削除を実行
            isMounted.current && router.replace(`/happiness/${type}`)
          }}
          period={period}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        rowSpacing={4}
        columnSpacing={1}
        justifyContent={'center'}
        sx={{ px: { md: '16px' }, my: { xs: '32px', md: 0 } }}
      >
        <Grid
          container
          justifyContent="center"
          rowSpacing={4}
          columnSpacing={1}
          sx={{ px: { xs: '16px', md: 0 }, my: { xs: '0px' } }}
        >
          <Grid item xs={12} md={12} lg={8}>
            <ButtonGroup size="large" aria-label="large button group" fullWidth>
              <Button
                key="month"
                variant={period === PeriodType.Month ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(PeriodType.Month)}
                disabled={isLoading}
              >
                月
              </Button>
              <Button
                key="day"
                variant={period === PeriodType.Day ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(PeriodType.Day)}
                disabled={isLoading}
              >
                日
              </Button>
              <Button
                key="time"
                variant={period === PeriodType.Time ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(PeriodType.Time)}
                disabled={isLoading}
              >
                時間
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="開始日"
              timeLabel="時間"
              period={period}
              disabled={isLoading}
              {...startProps}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              period={period}
              disabled={isLoading}
              {...endProps}
            />
          </Grid>
          <Grid container item xs={12} md={12} lg={8} columnSpacing={1}>
            <Grid item xs={8} md={8} />
            <Grid item xs={4} md={4}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderColor: 'primary.light' }}
                onClick={handleSearch}
                disabled={isLoading}
              >
                検索
              </Button>
            </Grid>
          </Grid>
          {session?.user?.type === PROFILE_TYPE.GENERAL && (
            <Grid
              item
              md={12}
              lg={8}
              sx={{
                position: { xs: 'fixed', md: 'static' },
                bottom: { xs: '10px', md: 'auto' },
                left: { xs: '10px', md: 'auto' },
                right: { xs: '10px', md: 'auto' },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => router.push('/happiness/input')}
              >
                幸福度を入力
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default HappinessViewer
