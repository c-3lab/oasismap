'use client'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  styled,
} from '@mui/material'
import { useContext, useState } from 'react'
import { MessageType } from '@/types/message-type'
import { ERROR_TYPE } from '@/libs/constants'
import { signOut, useSession } from 'next-auth/react'
import { messageContext } from '@/contexts/message-context'
import { useFetchData } from '@/libs/fetch'
import { useRouter } from 'next/navigation'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const Import: React.FC = () => {
  const noticeMessageContext = useContext(messageContext)
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isRefresh, setIsRefresh] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { update } = useSession()
  const { upload } = useFetchData()

  const fileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file?.type !== 'text/csv') {
      setErrorMessage('CSVファイルを選択してください')
      setFile(null)
      setFileName('')
      return
    }

    setFile(file)
    setFileName(file.name)
  }

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    overflow: 'hidden',
    position: 'absolute',
  })

  const uploadCsv = async () => {
    if (!file) {
      setErrorMessage('ファイルが選択されていません')
      return
    }
    setIsUploading(true)

    try {
      // アクセストークンを再取得
      const updatedSession = await update()

      const url = backendUrl + '/api/happiness/import'

      const formData = new FormData()
      formData.append('isRefresh', String(isRefresh))
      formData.append('csvFile', file)

      await upload(url, formData, updatedSession?.user?.accessToken!)

      noticeMessageContext.showMessage(
        'データのインポートに成功しました',
        MessageType.Success
      )
      router.push('/happiness/all')
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
          'データのインポートに失敗しました',
          MessageType.Error
        )
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ my: 6, flexDirection: 'column' }}
    >
      <Grid item xs={12}>
        <Typography variant="subtitle1" align="left">
          CSVファイル
        </Typography>
        <Button
          component="label"
          variant="outlined"
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          {fileName || 'ファイルを選択'}
          <VisuallyHiddenInput
            accept=".csv"
            type="file"
            onChange={fileChange}
          />
        </Button>
        {errorMessage && (
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        )}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRefresh}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setIsRefresh(event.target.checked)
                }
                color="primary"
              />
            }
            label="既存のデータを全て削除してインポート"
          />
        </Grid>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => uploadCsv()}
            disabled={isUploading}
          >
            インポート
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Import
