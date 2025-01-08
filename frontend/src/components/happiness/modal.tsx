import { Modal, Box, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface ModalProps {
  data: any
  onClose: () => void
}
interface QuestionTitles {
  [key: string]: string
}
const questionTitles: QuestionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export const OpenModal: React.FC<ModalProps> = ({ onClose, data }) => {
  return (
    <Modal open={!!data} onClose={onClose} aria-labelledby="modal-modal-title">
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
        <span>
          {data !== null && data.answer1 === 1 && (
            <h3 style={{ color: '#007fff', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness1}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer1 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#007fff',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness1}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer2 === 1 && (
            <h3 style={{ color: '#4BA724', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness2}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer2 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#4BA724',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness2}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer3 === 1 && (
            <h3 style={{ color: '#7f00ff', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness3}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer3 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#7f00ff',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness3}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer4 === 1 && (
            <h3 style={{ color: '#FF00D8', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness4}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer4 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#FF00D8',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness4}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer5 === 1 && (
            <h3 style={{ color: '#ff7f00', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness5}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer5 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#ff7f00',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness5}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer6 === 1 && (
            <h3 style={{ color: '#ff0000', display: 'flex' }}>
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
              <Typography
                id="modal-modal-title"
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
                <a>{questionTitles.happiness6}</a>
              </Typography>
            </h3>
          )}
          {data !== null && data.answer6 === 0 && (
            <h3>
              <Typography
                id="modal-modal-title"
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
                <a
                  style={{
                    color: '#ff0000',
                    opacity: 0.3,
                    marginLeft: '18px',
                  }}
                >
                  {questionTitles.happiness6}
                </a>
              </Typography>
            </h3>
          )}
          {data !== null && data.memo !== undefined && (
            <label>
              <h3>
                <Typography
                  id="modal-modal-title"
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
              </h3>
            </label>
          )}
          {data !== null && data.basetime && (
            <label
              style={{
                bottom: '10%',
                right: '10px',
              }}
            >
              <Typography
                id="modal-modal-title"
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
            </label>
          )}
        </span>
      </Box>
    </Modal>
  )
}
