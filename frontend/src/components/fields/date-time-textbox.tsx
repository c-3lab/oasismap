import { useState } from 'react'
import { DateTime } from 'luxon'

import { Grid, TextField } from '@mui/material'
import { DateTime as OasismapDateTime } from '@/types/datetime'

interface DateTimeTextboxProps {
  dateLabel: string
  timeLabel: string
  value: OasismapDateTime
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean | undefined
}

export const DateTimeTextbox: React.FC<DateTimeTextboxProps> = (props) => {
  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={8}>
        <TextField
          label={props.dateLabel}
          name="date"
          type="date"
          value={props.value.date}
          onChange={props.onChange}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          disabled={!!props.disabled}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label={props.timeLabel}
          name="time"
          type="time"
          value={props.value.time}
          onChange={props.onChange}
          disabled={!!props.disabled}
          fullWidth
        />
      </Grid>
    </Grid>
  )
}

export const useDateTimeProps = (timestamp?: string | null) => {
  let defaultDateTime: DateTime
  if (timestamp && DateTime.fromISO(timestamp).isValid) {
    defaultDateTime = DateTime.fromISO(timestamp)
  } else {
    defaultDateTime = DateTime.local()
  }

  const startProps = useDateTime({
    date: defaultDateTime.toFormat('yyyy-MM-dd'),
    time: '00:00',
  })
  const endProps = useDateTime({
    date: defaultDateTime.toFormat('yyyy-MM-dd'),
    time: '23:59',
  })

  return { startProps, endProps }
}

const useDateTime = (initialValue: OasismapDateTime) => {
  const [value, setValue] = useState(initialValue)

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValue((prevState) => ({ ...prevState, [name]: value }))
  }

  return { value, setValue, onChange }
}
