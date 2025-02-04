import { Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

type HappinessTitleProps = {
  type: 'modal' | 'popup'
  title: string
  color: string
  selected: boolean
}

export const HappinessTitle: React.FC<HappinessTitleProps> = ({
  type,
  title,
  color,
  selected,
}) => {
  return (
    <Box sx={{ color: selected ? color : 'gray', display: 'flex' }}>
      <Box sx={{ width: '18px', display: 'flex', alignItems: 'center' }}>
        {selected && <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
      </Box>
      {type === 'popup' ? (
        <Box
          sx={{
            fontSize: '1rem',
            fontWeight: 'bolder',
          }}
        >
          <span style={{ verticalAlign: 'sub' }}>{title}</span>
        </Box>
      ) : (
        <Box>
          <span style={{ verticalAlign: 'baseline' }}>{title}</span>
        </Box>
      )}
    </Box>
  )
}
