import { useState } from 'react'
import { Grid, TextField } from '@mui/material'

import { DateTime } from '@/types/datetime'

interface DateTimeTextboxProps {
  dateLabel: string
  timeLabel: string
  value: DateTime
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
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
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label={props.timeLabel}
          name="time"
          type="time"
          value={props.value.time}
          onChange={props.onChange}
          fullWidth
        />
      </Grid>
    </Grid>
  )
}

export const useDateTime = (initialValue: DateTime) => {
  const [value, setValue] = useState(initialValue)

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValue((prevState) => ({ ...prevState, [name]: value }))
  }

  return { value, onChange }
}
