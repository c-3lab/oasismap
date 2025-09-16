'use client'
import dynamic from 'next/dynamic'
import React, { useContext, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  OutlinedInput,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
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

  const [selectedHappiness, setSelectedHappiness] = useState<HappinessKey | ''>(
    ''
  )
  const [memo, setMemo] = useState('')
  const [exif, setExif] = useState<Exif | null>(null)
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  // Get current position on component mount
  useEffect(() => {
    updateCurrentPosition()
  }, [])

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

  const createAnswersFromSelected = (
    selectedHappiness: string
  ): { [key in HappinessKey]: number } => {
    return {
      happiness1: selectedHappiness === 'happiness1' ? 1 : 0,
      happiness2: selectedHappiness === 'happiness2' ? 1 : 0,
      happiness3: selectedHappiness === 'happiness3' ? 1 : 0,
      happiness4: selectedHappiness === 'happiness4' ? 1 : 0,
      happiness5: selectedHappiness === 'happiness5' ? 1 : 0,
      happiness6: selectedHappiness === 'happiness6' ? 1 : 0,
    }
  }

  // ラジオボタンの状態が選択されているかどうかをチェック
  const isAllUnchecked = selectedHappiness === ''

  const checkboxLabels: { [key in HappinessKey]: string } = {
    happiness1: 'ワクワクする場所です',
    happiness2: '新たな発見や学びのある場所です',
    happiness3: 'ホッとする場所です',
    happiness4: '自分を取り戻せる場所です',
    happiness5: '自慢の場所です',
    happiness6: '思い出の場所です',
  }

  // ラジオボタンの状態を変更
  const handleHappinessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedHappiness(event.target.value as HappinessKey)
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
      const answers = createAnswersFromSelected(selectedHappiness)
      let payload: HappinessRequestBody = {
        latitude: 0,
        longitude: 0,
        memo: memo,
        answers: answers,
      }

      if (
        exif?.latitude !== undefined &&
        exif?.longitude !== undefined &&
        exif?.timestamp
      ) {
        payload.latitude = exif.latitude
        payload.longitude = exif.longitude
        payload.timestamp = exif.timestamp.toISOString()
      } else {
        payload.latitude = currentPosition?.latitude ?? 0
        payload.longitude = currentPosition?.longitude ?? 0
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
        {/* Map display always */}
        <Box sx={{ height: '300px', marginTop: '16px', marginBottom: '16px' }}>
          <PreviewMap
            latitude={exif?.latitude ?? currentPosition?.latitude ?? 35.6581064}
            longitude={
              exif?.longitude ?? currentPosition?.longitude ?? 139.7413637
            }
            answer={createAnswersFromSelected(selectedHappiness)}
          />
        </Box>
        <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
          そのスポットで感じた魅力を選択してください
        </Typography>
        <RadioGroup value={selectedHappiness} onChange={handleHappinessChange}>
          {Object.entries(checkboxLabels).map(([key, label]) => (
            <FormControlLabel
              key={key}
              value={key}
              control={<Radio />}
              label={label}
              sx={{
                fontSize: 18,
                '& .MuiFormControlLabel-label': {
                  fontWeight: selectedHappiness === key ? 'bold' : 'normal',
                },
              }}
            />
          ))}
        </RadioGroup>
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
