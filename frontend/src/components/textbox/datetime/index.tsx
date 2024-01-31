import { Grid, TextField } from '@mui/material'
import { DateTimeText } from './type'

interface DateTimeTextboxProps {
  dateLabel: string
  timeLabel: string
  value: DateTimeText
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function DateTimeTextbox(props: DateTimeTextboxProps) {
  return (
    <>
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
    </>
  )
}

export default DateTimeTextbox
