import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

import style from './index.module.css';

interface ButtonProps {
  month: string;
  day: string;
  time: string;
}

function PeriodButton(props: ButtonProps) {

  const buttons = [
    <Button className={style.month} onClick={() => alert('MONTH')}>{props.month}</Button>,
    <Button className={style.day} onClick={() => alert('DAY')}>{props.day}</Button>,
    <Button className={style.time} onClick={() => alert('TIME')}>{props.time}</Button>,
  ];

  const router = useRouter();

  return (
    <div>
      <Box className={style.box_container}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group"
          sx={{
            textAlign: 'center',
            alignItems: 'center',
            '& > *': {
              m: 1,
            },
          }}>
          {buttons}
        </ButtonGroup>
      </Box>
      <br />
    </div>
  )
}

export default PeriodButton;