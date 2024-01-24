import React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { InputLabel } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import style from './index.module.css';

interface ButtonProps {
  startingPeriod: string;
  finishingPeriod: string;
  label: string;
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textFieldDate: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 135,
  },
  textFieldTime: {
    width: 84,
    maxWidth: 'auto'
  },
  boxContainer: {
    minWidth: 219,
  }
}));

function DateTimeTextbox(props: ButtonProps) {
  const classes = useStyles();
  const router = useRouter();

  return (
    <div className={classes.container}>
      {/* box_container */}
      <Box className={style.boxContainer}>
        <Box>
          <TextField
            id="date"
            label={props.label}
            type="date"
            defaultValue="2024-01-24"
            className={classes.textFieldDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            id="standard-helperText"
            label="時間"
            type="time"
            defaultValue="12:00"
            className={classes.textFieldTime}
          />
        </Box>
      </Box>
    </div>
  )
}

export default DateTimeTextbox;