import { useState } from 'react'
import { DateTimeText } from '@/component/textbox/datetime/type'

const useDateTimeText = (defaultValue: DateTimeText) => {
  const [dateTimeText, setDateTimeText] = useState<DateTimeText>({
    date: defaultValue.date,
    time: defaultValue.time,
  })

  const onChangeInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setDateTimeText((prevState) => ({ ...prevState, [name]: value }))
  }

  return { dateTimeText, onChangeInputValue }
}

export default useDateTimeText
