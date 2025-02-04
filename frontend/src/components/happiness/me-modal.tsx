import React from 'react'
import { Modal, Box, Typography } from '@mui/material'
import { Pin } from '@/types/pin'
import { questionTitles } from '@/libs/constants'
import { mapColors } from '@/theme/color'
import { HappinessTitle } from './happiness-title'

type MeModalProps = {
  data: Pin | null
  onClose: () => void
}

export const MeModal: React.FC<MeModalProps> = ({ onClose, data }) => {
  if (data === null) {
    return
  }
  return (
    <Modal open={!!data} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          width: { xs: '90%', sm: 'auto' },
        }}
      >
        <>
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness1}
            color={mapColors.BLUE[0]}
            selected={data.answer1 === 1}
          />
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness2}
            color={mapColors.GREEN[0]}
            selected={data.answer2 === 1}
          />
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness3}
            color={mapColors.VIOLET[0]}
            selected={data.answer3 === 1}
          />
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness4}
            color={mapColors.YELLOW[0]}
            selected={data.answer4 === 1}
          />
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness5}
            color={mapColors.ORANGE[0]}
            selected={data.answer5 === 1}
          />
          <HappinessTitle
            type="modal"
            title={questionTitles.happiness6}
            color={mapColors.RED[0]}
            selected={data.answer6 === 1}
          />
          {data.memo && (
            <Typography sx={{ marginTop: 2 }}>{data.memo}</Typography>
          )}
          {data.timestamp && (
            <Typography
              sx={{
                marginTop: 2,
                textAlign: 'right',
              }}
            >
              回答日時：
              {data.timestamp}
            </Typography>
          )}
        </>
      </Box>
    </Modal>
  )
}
