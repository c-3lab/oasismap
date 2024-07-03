import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

import { Grid, TextField } from '@mui/material'
import { DateTime as OasismapDateTime } from '@/types/datetime'
import { PeriodType } from '@/types/period'

interface DateTimeTextboxProps {
  dateLabel: string
  timeLabel: string
  period: PeriodType
  value: OasismapDateTime
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
          disabled={props.period !== PeriodType.Time}
          fullWidth
        />
      </Grid>
    </Grid>
  )
}

export const useDateTimeProps = (period: PeriodType) => {
  const defaultDateTime = DateTime.local()

  const startProps = useDateTime({
    date: defaultDateTime.toFormat('yyyy-MM-dd'),
    time: '00:00',
  })
  const endProps = useDateTime({
    date: defaultDateTime.toFormat('yyyy-MM-dd'),
    time: '23:59',
  })

  const [updatedPeriod, setUpdatedPeriod] = useState(period)

  useEffect(() => {
    startProps.setValue({
      ...startProps.value,
      time: '00:00',
    })
    endProps.setValue({
      ...endProps.value,
      time: '23:59',
    })
    setUpdatedPeriod(period)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  return { startProps, endProps, updatedPeriod }
}

const useDateTime = (initialValue: OasismapDateTime) => {
  const [value, setValue] = useState(initialValue)

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValue((prevState) => ({ ...prevState, [name]: value }))
  }

  return { value, setValue, onChange }
}
