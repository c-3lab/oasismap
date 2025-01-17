import { Modal, Box, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Pin } from '@/types/pin'
import { questionTitles } from '@/libs/constants'
import { graphColors } from '@/theme/color'
import React from 'react'

interface ModalProps {
  data: Pin | null
  onClose: () => void
}

type ModalBlockProps = {
  title: string
  color: string
  selected: boolean
}

const ModalBlock: React.FC<ModalBlockProps> = ({ title, color, selected }) => {
  return (
    <div style={{ color: color, display: 'flex' }}>
      <div style={{ width: '18px' }}>
        {selected === true && (
          <CheckCircleIcon
            sx={{
              marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
              fontSize: {
                xs: 'small',
                sm: 'large',
                md: 'large',
                lg: 'large',
                xl: 'large',
              },
            }}
          />
        )}
      </div>
      <Typography
        sx={{
          opacity: selected ? 1 : 0.3,
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
    </div>
  )
}

export const DetailModal: React.FC<ModalProps> = ({ onClose, data }) => {
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
        {data !== null && (
          <>
            <ModalBlock
              title={questionTitles.happiness1}
              color={graphColors[0]}
              selected={data.answer1 === 1}
            />
            <ModalBlock
              title={questionTitles.happiness2}
              color={graphColors[1]}
              selected={data.answer2 === 1}
            />
            <ModalBlock
              title={questionTitles.happiness3}
              color={graphColors[2]}
              selected={data.answer3 === 1}
            />
            <ModalBlock
              title={questionTitles.happiness3}
              color={graphColors[3]}
              selected={data.answer4 === 1}
            />
            <ModalBlock
              title={questionTitles.happiness4}
              color={graphColors[4]}
              selected={data.answer5 === 1}
            />
            <ModalBlock
              title={questionTitles.happiness4}
              color={graphColors[5]}
              selected={data.answer6 === 1}
            />
            {data.memo !== undefined && (
              <div>
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
              </div>
            )}
            {data.timestamp && (
              <div
                style={{
                  bottom: '10%',
                  right: '10px',
                }}
              >
                <Typography
                  sx={{
                    marginTop: { xs: 4 },
                    display: 'flex',
                    justifyContent: 'flex-end',
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
              </div>
            )}
          </>
        )}
      </Box>
    </Modal>
  )
}
