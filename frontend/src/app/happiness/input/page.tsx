'use client'
import React, { useContext, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Checkbox,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'

import { messageContext } from '@/contexts/message-context'
import { useSession } from 'next-auth/react'
import postData from '@/components/happiness/post'

type HappinessKey =
  | 'happiness1'
  | 'happiness2'
  | 'happiness3'
  | 'happiness4'
  | 'happiness5'
  | 'happiness6'

const backendurl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/happiness`

const HappinessInput: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const referral = searchParams.get('referral') || 'me'
  const { data: session } = useSession()

  const [checkboxValues, setCheckboxValues] = useState<{
    [key in HappinessKey]: number
  }>({
    happiness1: 0,
    happiness2: 0,
    happiness3: 0,
    happiness4: 0,
    happiness5: 0,
    happiness6: 0,
  })

  // チェックボックスの状態が全て0かどうかをチェック
  const isAllUnchecked = !Object.values(checkboxValues).some(Boolean)

  const checkboxLabels: { [key in HappinessKey]: string } = {
    happiness1: '➀ ワクワクする場所です',
    happiness2: '➁ 新たな発見や学びのある場所です',
    happiness3: '➂ ホッとする場所です',
    happiness4: '➃ 自分を取り戻せる場所です',
    happiness5: '➄ 自慢の場所です',
    happiness6: '➅ 思い出の場所です',
  }

  // チェックボックスの状態を変更
  const toggleCheckbox = (key: HappinessKey) => {
    setCheckboxValues((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }))
  }

  const submitForm = async () => {
    const position = await getCurrentPosition()
    await postData(backendurl, session?.user!.accessToken!, {
      latitude: position.latitude,
      longitude: position.longitude,
      happiness: checkboxValues,
    })
    noticeMessageContext.showMessage('幸福度の送信が完了しました')
    router.push(`/happiness/${referral}`)
  }

  const getCurrentPosition = async () => {
    if (location.protocol === 'http:') {
      return {
        latitude: 35.696031,
        longitude: 139.6879481,
      }
    } else {
      /* global GeolocationPosition */
      const position: GeolocationPosition = await new Promise(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        }
      )
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      rowSpacing={4.5}
      sx={{ p: '32px' }}
    >
      <Grid item xs={12} md={8}>
        <List dense disablePadding>
          {Object.entries(checkboxValues).map(([key, value]) => (
            <ListItem key={key} disablePadding>
              <ListItemButton
                sx={{ p: 0, height: 40, fontSize: 18 }}
                onClick={() => toggleCheckbox(key as HappinessKey)}
              >
                <ListItemText primary={checkboxLabels[key as HappinessKey]} />
                <Checkbox
                  edge="end"
                  color="default"
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  checked={value === 1}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12} md={8}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={() => submitForm()}
          disabled={isAllUnchecked}
        >
          幸福度を送信
        </Button>
      </Grid>
    </Grid>
  )
}

export default HappinessInput
