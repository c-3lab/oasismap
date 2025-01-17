import React from 'react'
import { Modal, Box, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Pin } from '@/types/pin'
import { questionTitles } from '@/libs/constants'
import { mapColors } from '@/theme/color'

type DetailModalProps = {
  data: Pin | null
  onClose: () => void
}

type HappinessTitleProps = {
  title: string
  color: string
  selected: boolean
}

const HappinessTitle: React.FC<HappinessTitleProps> = ({
  title,
  color,
  selected,
}) => {
  return (
    <Box style={{ color: selected ? color : 'gray', display: 'flex' }}>
      <Box style={{ width: '18px' }}>
        {selected && (
          <CheckCircleIcon
            sx={{
              marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
              fontSize: {
                xs: 'small',
                sm: 'large',
              },
            }}
          />
        )}
      </Box>
      <Typography
        sx={{
          fontSize: {
            xs: '0.75rem',
            sm: '1rem',
            md: '1.2rem',
            lg: '1.3rem',
            xl: '1.3rem',
          },
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}

export const DetailModal: React.FC<DetailModalProps> = ({ onClose, data }) => {
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
          width: {
            xs: '80%',
            sm: '90%',
            md: '80%',
            lg: '60%',
            xl: '30%',
          },
          height: {
            xs: '300px',
            sm: '325px',
            md: '400px',
            lg: '430px',
            xl: '430px',
          },
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <>
          <HappinessTitle
            title={questionTitles.happiness1}
            color={mapColors.BLUE[0]}
            selected={data.answer1 === 1}
          />
          <HappinessTitle
            title={questionTitles.happiness2}
            color={mapColors.GREEN[1]}
            selected={data.answer2 === 1}
          />
          <HappinessTitle
            title={questionTitles.happiness3}
            color={mapColors.VIOLET[2]}
            selected={data.answer3 === 1}
          />
          <HappinessTitle
            title={questionTitles.happiness4}
            color={mapColors.YELLOW[3]}
            selected={data.answer4 === 1}
          />
          <HappinessTitle
            title={questionTitles.happiness5}
            color={mapColors.ORANGE[4]}
            selected={data.answer5 === 1}
          />
          <HappinessTitle
            title={questionTitles.happiness6}
            color={mapColors.RED[5]}
            selected={data.answer6 === 1}
          />
          {data.memo && (
            <Typography
              sx={{
                marginTop: 2,
                fontSize: {
                  xs: '0.75rem',
                  sm: '1rem',
                  md: '1.2rem',
                  lg: '1.3rem',
                  xl: '1.3rem',
                },
              }}
            >
              {data.memo}
            </Typography>
          )}
          {data.timestamp && (
            <Typography
              sx={{
                marginTop: { xs: 4 },
                textAlign: 'right',
                bottom: '10%',
                right: '10px',
                fontSize: {
                  xs: '0.75rem',
                  sm: '1rem',
                  md: '1.2rem',
                  lg: '1.3rem',
                  xl: '1.3rem',
                },
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
