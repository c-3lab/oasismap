import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Sidebar from '../../Sidebar';

import styles from './index.module.css';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'fixed',
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: '#FFFFFF',
      boxShadow: 'none',
      color: '#000000',
    },
    toolbar: {
      padding: 0,
    },
    title: {
      flexGrow: 1,
      // TODO: StarSeeker配下のコードと比較し、theme.typography.fontWeightBoldの型が異なったため、直接boldを代入しました。
      fontWeight: 'bold',
      marginLeft: theme.spacing(5),
    },
    menuIcon: {
      fontSize: 40,
    },
  })
);

type Props = {
  title: string;
  message1: string; //　こちらの変数名を検討する必要があります。
  message2: string; //　こちらの変数名を検討する必要があります。
};

const Header: React.VFC<Props> = ({
  title,
  message1,
  message2,
}) => {
  const classes = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawerOpen = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          <div className=''>
            <span className={styles.link_display_1}>{message1}</span>
            <span className={styles.link_display_2}>{message2}</span>
          </div>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawerOpen}
          >
            <MenuIcon className={classes.menuIcon} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar
        isDrawerOpen={isDrawerOpen}
      />
    </>
  );
};

export default Header;
