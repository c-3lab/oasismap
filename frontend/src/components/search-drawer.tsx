import React from 'react'
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Grid,
  Button,
  Divider,
} from '@mui/material'
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { DateTimeProps } from '@/types/search-context'
import {
  DateTimeTextbox,
  useDateTimeProps,
} from '@/components/fields/date-time-textbox'

interface SearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (startProps: DateTimeProps, endProps: DateTimeProps) => void
  isLoading?: boolean
}

const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  onSearch,
  isLoading = false,
}) => {
  const { startProps, endProps } = useDateTimeProps()

  const handleSearch = async () => {
    onSearch(startProps, endProps)

    onClose()
  }

  return (
    <Drawer anchor={'bottom'} open={isOpen} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <ChevronDownIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            検索条件
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              開始日時
            </Typography>
            <DateTimeTextbox
              dateLabel="開始日"
              timeLabel="時間"
              disabled={isLoading}
              {...startProps}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              終了日時
            </Typography>
            <DateTimeTextbox
              dateLabel="終了日"
              timeLabel="時間"
              disabled={isLoading}
              {...endProps}
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSearch}
              disabled={isLoading}
            >
              検索
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  )
}

export default SearchDrawer
