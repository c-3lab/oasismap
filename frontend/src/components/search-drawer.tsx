import React from 'react'
import { Drawer, Box, Typography, Grid, Divider } from '@mui/material'
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ActionLogButton, ActionLogIconButton } from '@/components/mui'
import { pushActionLog } from '@/libs/client-error-reporting'
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

  const handleDrawerClose = () => {
    pushActionLog('click', 'searchDrawerClose')
    onClose()
  }

  return (
    <Drawer anchor={'bottom'} open={isOpen} onClose={handleDrawerClose}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ActionLogIconButton
            actionLog="searchDrawerClose"
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            <ChevronDownIcon />
          </ActionLogIconButton>
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
            <ActionLogButton
              actionLog="search"
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSearch}
              disabled={isLoading}
            >
              検索
            </ActionLogButton>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  )
}

export default SearchDrawer
