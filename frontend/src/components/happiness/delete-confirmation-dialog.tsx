import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material'
import { Data } from '@/types/happiness-list-response'
import { timestampToDateTime } from '@/libs/date-converter'

interface DeleteConfirmationDialogProps {
  data: Data | null
  onClose: () => void
  deleteRowData: () => void
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  onClose,
  deleteRowData,
  data,
}) => {
  return (
    <Dialog
      open={!!data}
      onClose={onClose}
      transitionDuration={0}
      aria-labelledby="deleting-confirmation-dialog"
      aria-describedby="deleting-data"
    >
      <DialogTitle id="deleting-confirmation-dialog">削除確認</DialogTitle>
      <DialogContent id="deleting-data">
        <Typography variant="body1" gutterBottom>
          以下の幸福度情報を削除してもよろしいですか？
        </Typography>
        <Typography variant="body2" gutterBottom>
          {`送信日時: ${
            data?.timestamp ? timestampToDateTime(data.timestamp) : ''
          }`}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {`送信住所: ${data?.location?.place}`}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {`メモ: ${data?.memo}`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} color="success">
          いいえ
        </Button>
        <Button variant="outlined" onClick={deleteRowData} color="primary">
          はい
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmationDialog
