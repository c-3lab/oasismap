'use client'
import dynamic from 'next/dynamic'
import React, { useContext, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Box,
  Checkbox,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material'

const PreviewMap = dynamic(() => import('@/components/map/previewMap'), {
  ssr: false,
})
import { messageContext } from '@/contexts/message-context'
import { MessageType } from '@/types/message-type'
import { ERROR_TYPE } from '@/libs/constants'
import { useFetchData } from '@/libs/fetch'
import { HappinessRequestBody } from '@/libs/fetch'
import { getCurrentPosition } from '@/libs/geolocation'
import { timestampToDateTime } from '@/libs/date-converter'
import { HappinessKey } from '@/types/happiness-key'
import exifr from 'exifr'

type Errors = {
  field: string
  message: string
}[]

type Exif = {
  latitude?: number
  longitude?: number
  timestamp?: Date
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const HappinessInput: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const referral = searchParams.get('referral') || 'me'
  const { update } = useSession()
  const { postData } = useFetchData()

  const [errors, setErrors] = useState<Errors>([])
  const [mode, setMode] = useState<'current' | 'past'>('current')
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
  const [memo, setMemo] = useState('')
  const [exif, setExif] = useState<Exif | null>(null)
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  // Get current position on component mount
  React.useEffect(() => {
    updateCurrentPosition()
  }, [])

  const getCurrentPositionForPayload = async () => {
    const position = await getCurrentPosition()
    if (position.latitude === undefined || position.longitude === undefined)
      throw new Error('Geolocation is not available')
    return position
  }

  // Common function to update current position
  const updateCurrentPosition = async () => {
    try {
      const position = await getCurrentPosition()
      if (position.latitude !== undefined && position.longitude !== undefined) {
        setCurrentPosition(position)
      }
    } catch (error) {
      console.error('Error getting current position:', error)
    }
  }

  // 入力モード選択用ラジオボタンの状態を変更
  const handleMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(errors.filter((error) => error.field !== 'image'))
    setExif(null)
    setMode(event.target.value as 'current' | 'past')
  }

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

  // メモの入力内容を変更
  const handleMemo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(errors.filter((error) => error.field !== 'memo'))
    const memo = event.target.value
    setMemo(memo)

    if (memo.length > 30) {
      setErrors((prev) => {
        return [
          ...prev,
          {
            field: 'memo',
            message: '30文字以内で入力してください',
          },
        ]
      })
    }
  }

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(errors.filter((error) => error.field !== 'image'))
    setExif(null)

    const image = event.target.files?.[0]
    if (!image) return

    try {
      const rawExif = await exifr.parse(image)
      const exif = {
        timestamp: rawExif?.CreateDate,
        latitude: isNaN(rawExif?.latitude) ? undefined : rawExif?.latitude,
        longitude: isNaN(rawExif?.longitude) ? undefined : rawExif?.longitude,
      }
      let missingFields: string[] = []
      if (exif.timestamp === undefined) missingFields.push('撮影日時')
      if (exif.latitude === undefined) missingFields.push('緯度')
      if (exif.longitude === undefined) missingFields.push('経度')
      if (missingFields.length === 3 && image.name === 'image.jpg') {
        setErrors((prev) => {
          return [
            ...prev,
            {
              field: 'image',
              message: `写真から${missingFields.join(', ')}を取得できませんでした。「写真を撮る」機能は利用できません。`,
            },
          ]
        })
      } else if (missingFields.length > 0) {
        setErrors((prev) => {
          return [
            ...prev,
            {
              field: 'image',
              message: `写真から${missingFields.join(', ')}を取得できませんでした。`,
            },
          ]
        })
      }
      setExif(exif)
    } catch (error) {
      console.error('Error:', error)
      setErrors((prev) => {
        return [
          ...prev,
          {
            field: 'image',
            message: '写真の読み込みに失敗しました。',
          },
        ]
      })
    }
  }

  const submitForm = async () => {
    try {
      let payload: HappinessRequestBody = {
        latitude: 0,
        longitude: 0,
        memo: memo,
        answers: checkboxValues,
      }
      if (
        mode === 'past' &&
        exif?.latitude !== undefined &&
        exif?.longitude !== undefined &&
        exif?.timestamp
      ) {
        payload.latitude = exif.latitude
        payload.longitude = exif.longitude
        payload.timestamp = exif.timestamp.toISOString()
      } else {
        const position = await getCurrentPositionForPayload()
        payload.latitude = position.latitude
        payload.longitude = position.longitude
      }

      const url = backendUrl + '/api/happiness'
      // アクセストークンを再取得
      const updatedSession = await update()

      await postData(url, payload, updatedSession?.user?.accessToken!)
      noticeMessageContext.showMessage(
        '幸福度の送信が完了しました',
        MessageType.Success
      )
      router.push(`/happiness/${referral}`)
    } catch (error) {
      console.error('Error:', error)
      if (error instanceof Error && error.message === ERROR_TYPE.UNAUTHORIZED) {
        noticeMessageContext.showMessage(
          '再ログインしてください',
          MessageType.Error
        )
        signOut({ redirect: false })
        router.push('/login')
      } else {
        noticeMessageContext.showMessage(
          '幸福度の送信に失敗しました',
          MessageType.Error
        )
      }
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      rowSpacing={4.5}
      sx={{ p: '32px', marginBottom: '64px' }}
    >
      <Grid item xs={12} md={8}>
        <RadioGroup value={mode} onChange={handleMode} row>
          <FormControlLabel
            value="current"
            control={<Radio />}
            label="現在の幸福度を入力"
          />
          <FormControlLabel
            value="past"
            control={<Radio />}
            label="撮影した場所の幸福度を入力"
          />
        </RadioGroup>

        {/* Map display always */}
        <Box sx={{ height: '300px', marginTop: '16px', marginBottom: '16px' }}>
          <PreviewMap
            latitude={exif?.latitude ?? currentPosition?.latitude ?? 35.6581064}
            longitude={
              exif?.longitude ?? currentPosition?.longitude ?? 139.7413637
            }
            answer={checkboxValues}
          />
        </Box>

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
        <TextField
          id="memo"
          label="メモ"
          placeholder="場所名など、その場所の特徴を入力してください"
          size="small"
          margin="normal"
          fullWidth
          sx={{
            '& .MuiInputBase-input': { color: 'text.primary' },
            '& label': { color: 'text.primary' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'text.primary' },
            },
          }}
          InputLabelProps={{ shrink: true }}
          onChange={handleMemo}
          error={errors.some((error) => error.field === 'memo')}
          helperText={errors.find((error) => error.field === 'memo')?.message}
        />
        {mode === 'past' && (
          <FormControl id="image" fullWidth>
            <OutlinedInput
              type="file"
              onChange={handleImage}
              error={errors.some((error) => error.field === 'image')}
              inputProps={{
                accept: 'image/*',
              }}
              sx={{
                marginTop: '16px',
                input: {
                  paddingBottom: '12px',
                  paddingTop: '7px',
                },
              }}
            />
            <FormHelperText
              error={errors.some((error) => error.field === 'image')}
            >
              {errors.find((error) => error.field === 'image')?.message}
            </FormHelperText>
            {!exif ? (
              <>
                <FormHelperText>過去の写真を選択してください。</FormHelperText>
                <FormHelperText>
                  選択した写真から取得した撮影日時・緯度・経度を利用して幸福度を登録します。
                </FormHelperText>
                <FormHelperText>選択した写真は保存されません。</FormHelperText>
              </>
            ) : (
              <>
                <FormHelperText>
                  撮影日時：
                  {exif?.timestamp &&
                    timestampToDateTime(exif.timestamp.toISOString())}
                </FormHelperText>
                <FormHelperText>緯度：{exif?.latitude}</FormHelperText>
                <FormHelperText>経度：{exif?.longitude}</FormHelperText>
              </>
            )}
          </FormControl>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          position: 'fixed',
          bottom: '32px',
          width: '100%',
          px: { xs: '32px', md: '0' },
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={() => submitForm()}
          disabled={isAllUnchecked || errors.length > 0}
          sx={{
            '&.Mui-disabled': {
              backgroundColor: '#E0E0E0',
              color: '#BDBDBD',
            },
          }}
        >
          幸福度を送信
        </Button>
      </Grid>
    </Grid>
  )
}

export default HappinessInput
